# Field notes

Five debugging results from the last year, kept because each one broke an assumption rather than a line of code. Product details are omitted; the mechanics are the point.

## A page shipped 8.1 MB because a shared module sat in the wrong chunk

**Symptom.** First load was enormous on every route, including routes with no 3D content at all. Chunk analysis looked reasonable: the 3D engine was split out, as intended.

**Diagnosis.** Chunk size is not the same question as what a page loads. React had ended up inside the eager 3D chunk, so any page importing React pulled the entire chunk with it. The split existed on paper and did nothing in practice. The bundle report showed the boundary and never showed that the boundary was never crossed lazily.

**Result.** Moving the shared module out and making the engine runtime genuinely lazy cut the mandatory payload by 94.6%.

**Lesson.** Measure what a route actually fetches, not how the bundler grouped things.

## Clustered lighting was never enabled, on any machine

**Symptom.** Light counts stayed at the old hard ceiling. The clustered path was implemented, merged and apparently in use.

**Diagnosis.** The capability check asked for the limit under a WebGPU-specific name. On WebGL2 that query answered negatively, so the code fell back to the legacy path every time. Nobody had run the intended path, ever, because the fallback was silent and the feature flag reported enabled.

**Result.** After the fix, 60 live light sources render with 7 entries in the scene light list, the remainder going through the cluster container.

**Lesson.** A silent fallback plus an enabled flag is indistinguishable from a working feature until you assert on the path taken, not the config.

## The reference frame was pinned but not reproducible

**Symptom.** A pinned golden frame kept failing comparisons. The read was "not enough scenes covered", so the plan was to capture more.

**Diagnosis.** Coverage was not the blocker. The capture itself was non-deterministic, drifting frame to frame, so the baseline was noise being compared against noise. Two contributing bugs sat underneath: the overlay check read a field that did not exist on the object, and time-dependent shader work was an uncontrolled axis nobody had frozen.

**Result.** Drift went from 0.408 to 4e-5, at which point A/B comparison became meaningful and the gate started catching real regressions instead of its own jitter.

**Lesson.** Before adding cases to a failing gate, prove the gate is stable on a single case. A flaky oracle is worse than no oracle: it teaches the team to ignore red.

## The tool measuring CI loss was measuring the wrong endpoint

**Symptom.** A CI fleet was losing a large share of its result reports. Manual probes with curl came back clean, which pointed the investigation at the application.

**Diagnosis.** Two separate errors. The probe omitted the authorization header, so it was served by the CDN edge and never reached origin: it was measuring a different system and reporting health. Underneath, six agents on one host shared a single HTTP/2 connection, and that multiplexing was the actual failure surface.

**Result.** Same workload, same hosts: 82 stream aborts on HTTP/2 against 0 on HTTP/1.1.

**Lesson.** When the measurement disagrees with the symptom, suspect the measurement first. An unauthenticated probe is a different request.

## A scatter algorithm could not be tuned into clustering because it was structurally incapable

**Symptom.** Procedurally placed vegetation looked evenly spread and artificial next to a reference implementation. The assumption was a parameter problem, and tuning had been going on for a while.

**Diagnosis.** An A/B on identical meshes measured variance-to-mean ratio of placement density: 0.60 for our kernel against 80.6 for the reference. The kernel allowed one instance per cell by construction, so clustering was not weak, it was impossible. No parameter reaches a distribution the algorithm cannot express.

**Result.** The tuning track was closed and replaced with a structural change, which was the only thing that could have worked.

**Lesson.** Quantify the gap before tuning. A number told us in an afternoon what weeks of parameter sweeps would not have.

---

The recurring theme is that four of these five bugs were hiding behind something green. A passing gate, an enabled flag, a clean probe, a plausible chunk report. Building verification you can actually trust is most of the work in AI-assisted engineering, which is why I write about it in [agent-harness.md](agent-harness.md).
