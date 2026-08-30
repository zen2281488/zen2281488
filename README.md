<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark-v2.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/header-light-v2.svg">
  <img src="assets/header-dark-v2.svg" alt="zen2281488 - AI Platform Engineer with a QA Automation background" width="880">
</picture>

[![Telegram](https://img.shields.io/badge/Telegram-@zen__Warrior-1F2328?style=flat-square&logo=telegram&logoColor=F0883E)](https://t.me/zen_Warrior)
[![Email](https://img.shields.io/badge/Email-henvanilehmj%40outlook.com-1F2328?style=flat-square&logo=microsoftoutlook&logoColor=F0883E)](mailto:henvanilehmj@outlook.com)
[![Allure report](https://img.shields.io/badge/Live%20Allure%20report-1F2328?style=flat-square&logoColor=F0883E)](https://zen2281488.github.io/jqe_ui_api/)
![Profile views](https://komarev.com/ghpvc/?username=zen2281488&style=flat-square&color=F0883E&label=views)

I build the platform layer for closed-loop AI-assisted software delivery: agent infrastructure, evaluation systems, verification gates, and feedback loops that keep generated changes measurable and reviewable. My background is in QA automation, so the system is designed around evidence: a change does not ship merely because it was generated successfully.

**Academic foundation:** MSc in Applied Mathematics & Computer Science · MSc in Electrical Power Engineering

## Day job

**QA Automation Engineer, Java.** UI and API automation: Selenide, REST Assured, JUnit 5, TestNG, wired into pipelines so a red run blocks a merge instead of decorating a dashboard. Parallel browser grids, flake quarantine, and Allure reporting that survives contact with a real release train. This is the paid, professional half and it is where the test-engineering discipline comes from.

## Independent work

Everything below is built on my own time, outside working hours. It is where I build AI platform infrastructure and apply the same verification discipline to agentic software delivery and product engineering.

**AI platform and agent infrastructure.** Agent skills, hooks and multi-agent research and execution pipelines around LLM-assisted development. Evaluation systems, cost and observability harnesses, verification gates, reversible-change workflows. The goal is a loop that stays measurable: every generated change lands small, behind a gate, with a way back. Same tools and same person before and after, so the only variable is the harness rather than the adoption of AI, and the throughput difference is about an order of magnitude per month. [How it is built](engineering/agent-harness.md).

**Product engineering.** A real-time 3D web client on Babylon.js and WebGPU with a clustered lighting pipeline and procedural map generation, on a Kotlin and Spring Boot server-authoritative backend. Held to the same CI discipline as the day-job test code, because that is the half I already know how to do properly.

## Operating model

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/harness-loop-dark-v3.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/harness-loop-light-v3.svg">
  <img src="assets/harness-loop-dark-v3.svg" alt="Closed-loop agent harness: brief, research, implementation, verification, review, merge and observation" width="880">
</picture>

The harness is a closed control system, not a prompt chain. Research produces a bounded brief, implementation produces a diff, gates try to disprove it, and observation feeds the next pass. A failure returns to the stage that created the bad assumption instead of restarting the whole pipeline.

Research runs as a cascade: independent scouts inspect code, references and runtime evidence; a challenger searches for contradictions; a synthesizer turns only the surviving claims into acceptance criteria and a task graph. The detailed architecture, including worker roles, branch locks and failure routing, is in [the harness write-up](engineering/agent-harness.md#cascading-research-swarms).

## Stack

**Languages**
![Java](https://img.shields.io/badge/Java-1F2328?style=flat-square&logo=openjdk&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-1F2328?style=flat-square&logo=kotlin&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-1F2328?style=flat-square&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-1F2328?style=flat-square&logo=python&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-1F2328?style=flat-square&logo=postgresql&logoColor=white)

**Test automation**
![Selenide](https://img.shields.io/badge/Selenide-1F2328?style=flat-square)
![REST Assured](https://img.shields.io/badge/REST%20Assured-1F2328?style=flat-square)
![JUnit 5](https://img.shields.io/badge/JUnit%205-1F2328?style=flat-square&logo=junit5&logoColor=white)
![TestNG](https://img.shields.io/badge/TestNG-1F2328?style=flat-square)
![Playwright](https://img.shields.io/badge/Playwright-1F2328?style=flat-square&logo=playwright&logoColor=white)
![Allure](https://img.shields.io/badge/Allure%20TestOps-1F2328?style=flat-square)
![gRPC](https://img.shields.io/badge/gRPC-1F2328?style=flat-square&logo=grpc&logoColor=white)

**Agent tooling**
![Claude Code](https://img.shields.io/badge/Claude%20Code-1F2328?style=flat-square&logo=anthropic&logoColor=white)
![MCP](https://img.shields.io/badge/MCP%20servers-1F2328?style=flat-square)
![Skills & hooks](https://img.shields.io/badge/Skills%20%26%20hooks-1F2328?style=flat-square)
![Eval harness](https://img.shields.io/badge/Eval%20harness-1F2328?style=flat-square)
![Cost telemetry](https://img.shields.io/badge/Cost%20telemetry-1F2328?style=flat-square)

**Infrastructure and data**
![Docker](https://img.shields.io/badge/Docker-1F2328?style=flat-square&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-1F2328?style=flat-square&logo=githubactions&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-1F2328?style=flat-square&logo=jenkins&logoColor=white)
![Selenoid](https://img.shields.io/badge/Selenoid%20%2F%20Grid-1F2328?style=flat-square)
![Linux](https://img.shields.io/badge/Linux-1F2328?style=flat-square&logo=linux&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-1F2328?style=flat-square&logo=postgresql&logoColor=white)
![Greenplum](https://img.shields.io/badge/Greenplum-1F2328?style=flat-square)

## Writing

| | |
| --- | --- |
| [**Running an agent harness at 2 500+ commits a day**](engineering/agent-harness.md) | Why the bottleneck in AI-assisted engineering is disproving a change, not generating one. Gate design, domain oracles, adversarial review, and the before-and-after numbers with the caveats attached. |
| [**Field notes**](engineering/field-notes.md) | Five debugging results: an 8.1 MB payload caused by a shared module in the wrong chunk, clustered lighting that was never once enabled, a golden frame pinned but not reproducible, a CI probe measuring the wrong endpoint, and a scatter kernel that could not be tuned because it was structurally incapable. |

## Selected work

| Repo | What it is | Stack |
| --- | --- | --- |
| [**jqe_ui_api**](https://github.com/zen2281488/jqe_ui_api) | UI and API automation suite: booking-service API cases, bank-app UI cases, with a [published Allure report](https://zen2281488.github.io/jqe_ui_api/) | Java, Selenide, REST Assured, JUnit 5, Allure |
| [**AniViewJet**](https://github.com/zen2281488/AniViewJetRelease) | Android TV client shipped as signed APK releases, with its own source resolvers and release channel | Kotlin, Jetpack Compose, Android TV |
| [**WinnerOfDay**](https://github.com/zen2281488/WinnerOfDay) | VK community bot: picks a daily winner from chat history, keeps a leaderboard, answers through a swappable LLM backend | Python 3.11, Docker Compose, VK API, Groq / Venice |
| [**Silicium_3_0**](https://github.com/zen2281488/Silicium_3_0) and [**SiliciumSDETapiCase**](https://github.com/zen2281488/SiliciumSDETapiCase) | SDET practicum work and test assignments: REST API and UI suites | Java, JUnit, REST Assured |

More automation samples live in [**qaa_projects**](https://github.com/zen2281488/qaa_projects).

## Signal

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github-readme-stats-one-lyart.vercel.app/api?username=zen2281488&count_private=true&include_all_commits=true&show_icons=true&hide_border=true&bg_color=00000000&title_color=F0883E&icon_color=F0883E&text_color=ADBAC7">
  <img height="170" src="https://github-readme-stats-one-lyart.vercel.app/api?username=zen2281488&count_private=true&include_all_commits=true&show_icons=true&hide_border=true&bg_color=00000000&title_color=BC4C00&icon_color=BC4C00&text_color=3D444D" alt="GitHub statistics, private contributions counted">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://streak-stats.demolab.com/?user=zen2281488&hide_border=true&background=00000000&ring=F0883E&fire=F0883E&currStreakLabel=F0883E&currStreakNum=E6EDF3&sideNums=E6EDF3&sideLabels=768390&dates=636E7B&stroke=30363D">
  <img height="170" src="https://streak-stats.demolab.com/?user=zen2281488&hide_border=true&background=00000000&ring=BC4C00&fire=BC4C00&currStreakLabel=BC4C00&currStreakNum=1F2328&sideNums=1F2328&sideLabels=59636E&dates=818B98&stroke=D1D9E0" alt="Contribution streak">
</picture>

**Most of it is private, and most of it is after hours.** Roughly 30 of my 44 repositories are private, and that is where the harness, the 3D client and the tooling around them live. What is public here is test automation and side projects.

The volume is a working style, not a metric game. Changes land in small increments behind verification gates rather than as large unreviewed drops, which is what makes the rate survivable. Gate design and the caveats are in [agent-harness.md](engineering/agent-harness.md).

## Contact

Telegram: [@zen_Warrior](https://t.me/zen_Warrior)
