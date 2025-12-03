## [1.4.1](https://github.com/jmsutorus/homepage/compare/v1.4.0...v1.4.1) (2025-12-03)


### Bug Fixes

* **dashboard:** add goals section and improve loading states ([#11](https://github.com/jmsutorus/homepage/issues/11)) ([54711b8](https://github.com/jmsutorus/homepage/commit/54711b85b5fa062863b6f79ae3eb70d82d3fc6a5))
* **db:** add missing await keywords in async functions ([#12](https://github.com/jmsutorus/homepage/issues/12)) ([520b90a](https://github.com/jmsutorus/homepage/commit/520b90a7c3ea3a2dea2fe06edc484c2ccafed156))

# [1.4.0](https://github.com/jmsutorus/homepage/compare/v1.3.1...v1.4.0) (2025-12-03)


### Features

* **media:** add pagination for completed media with infinite scroll ([#10](https://github.com/jmsutorus/homepage/issues/10)) ([6c77239](https://github.com/jmsutorus/homepage/commit/6c77239857f28aef3bd78ca2fffaa8342232364b))

## [1.3.1](https://github.com/jmsutorus/homepage/compare/v1.3.0...v1.3.1) (2025-12-02)


### Bug Fixes

* **media:** resolve parameter order and display issues ([#8](https://github.com/jmsutorus/homepage/issues/8)) ([5c008ad](https://github.com/jmsutorus/homepage/commit/5c008ad83dca97bae9618fff5b3f17cdce478840))
* resolve async/await and parameter issues ([#9](https://github.com/jmsutorus/homepage/issues/9)) ([d499fb4](https://github.com/jmsutorus/homepage/commit/d499fb4eba0eca807dbdc76464be0db6dfed4aec))

# [1.3.0](https://github.com/jmsutorus/homepage/compare/v1.2.1...v1.3.0) (2025-12-02)


### Features

* **tasks:** add user templates and analytics tabs ([d2b89f7](https://github.com/jmsutorus/homepage/commit/d2b89f754dfb429991d25ac12f0fa29e15c28bb2))

## [1.2.1](https://github.com/jmsutorus/homepage/compare/v1.2.0...v1.2.1) (2025-12-02)


### Bug Fixes

* Resolve firebase quota error and search async bugs ([110987d](https://github.com/jmsutorus/homepage/commit/110987d877ead002571ed84dc035d49e122800f0))

# [1.2.0](https://github.com/jmsutorus/homepage/compare/v1.1.0...v1.2.0) (2025-12-02)


### Features

* Homepage now pulls weather data ([ad7580e](https://github.com/jmsutorus/homepage/commit/ad7580e7de6a8a803b3077ce136cb91aa8e433d9))

# [1.1.0](https://github.com/jmsutorus/homepage/compare/v1.0.0...v1.1.0) (2025-12-02)


### Features

* Migrated DB out of local storage to a dedicated server ([4eaf0ea](https://github.com/jmsutorus/homepage/commit/4eaf0eaf8d767199e9a7942ebbeab6c3bd9b653a))

# 1.0.0 (2025-11-30)


### Bug Fixes

* **auth:** merge callbacks to preserve user id in session ([57f10b1](https://github.com/jmsutorus/homepage/commit/57f10b1828cd3fb268a9d5479a0a98d0a2af2dcb))
* mini cal indicator updated ([31d08b8](https://github.com/jmsutorus/homepage/commit/31d08b84b1b6cf2f3397dcd1e0e1ef537bb1cdfd))
* Resolve server/client component boundaries ([afc3655](https://github.com/jmsutorus/homepage/commit/afc3655a4aac677ebe5d24ff1c336bfbdae40e29))
* **security:** add user-scoped data isolation for media and parks ([bc2c488](https://github.com/jmsutorus/homepage/commit/bc2c488307a0d9b5257010533d3a79144c182a30))


### Features

* **achievements:** add gamification achievements system ([82ba1ae](https://github.com/jmsutorus/homepage/commit/82ba1ae2ba4da0e9a5244f4f1f7ae029430a3f62))
* **achievements:** expand achievement system with new milestones ([2b04ba0](https://github.com/jmsutorus/homepage/commit/2b04ba09b5f2a4c72349481104791ba6fc40c908))
* Add Strava exercise tracking integration (Phase 4) ([a857259](https://github.com/jmsutorus/homepage/commit/a857259f955b06c1081ae89bc9153165b518946f))
* added the ability to customize calendar colors ([4ec8565](https://github.com/jmsutorus/homepage/commit/4ec8565bb8b1ea677550998fac8d9748b9b30701))
* **admin:** add role-based access control system ([98dcb95](https://github.com/jmsutorus/homepage/commit/98dcb95061cb1ff0693d2ff78ca6fc29c8e8bfeb))
* **auth:** add user allowlist and strava token refresh ([d7131af](https://github.com/jmsutorus/homepage/commit/d7131af26a8950e48c47d3adbde403e13bcd9139))
* **calendar:** add goals and milestones integration ([4019370](https://github.com/jmsutorus/homepage/commit/40193702c11be47c6d27175217853c219653f679))
* **dashboard:** add action banner for mood and habit reminders ([4d4b5ae](https://github.com/jmsutorus/homepage/commit/4d4b5aeabf3fac9e4b7fb8a94e302c310cf64101))
* **flags:** add firebase remote config for feature flags ([726e06c](https://github.com/jmsutorus/homepage/commit/726e06c4b819cea8c97b160d10d3602102dacaab))
* **goals:** add comprehensive goals tracking feature ([94eaa9a](https://github.com/jmsutorus/homepage/commit/94eaa9ab16f1aa5ba47314b521750b35311434ad))
* **habits:** add habit completion and enhanced streak tracking ([5886234](https://github.com/jmsutorus/homepage/commit/5886234edb83b3f4315e870f2b1fa74a764e3f99))
* **habits:** add habit tracking system ([051eb64](https://github.com/jmsutorus/homepage/commit/051eb64f448a470d8a3a92fe1423e70bde5dc7ab))
* **habits:** filter habits by creation date on daily pages ([a399059](https://github.com/jmsutorus/homepage/commit/a399059b7471b1b7f190135a5751b5e83d83e40e))
* Implement layout, navigation, and theme system ([447e5e6](https://github.com/jmsutorus/homepage/commit/447e5e6ed45a7285eca16b33c17801a81f783aeb))
* Implement media library and quick links (Phase 2) ([8f52265](https://github.com/jmsutorus/homepage/commit/8f52265fce252c942f71514e9f3e828ee9ce1736))
* **lint:** enforce cursor-pointer on all buttons ([ea90553](https://github.com/jmsutorus/homepage/commit/ea9055310458eadaff9a78b6e05640ab4185f97d))
* **media:** add filtering, sorting and tag management ([57310f4](https://github.com/jmsutorus/homepage/commit/57310f4c443bf21ac418caeda60e965f1eea22a1))
* **mobile:** implement responsive design across dashboard ([149651e](https://github.com/jmsutorus/homepage/commit/149651e6f401bf9b59d6e787b182124c88b2d307)), closes [hi#traffic](https://github.com/hi/issues/traffic)
* Phase 1 foundation - Project setup and structure ([d252ede](https://github.com/jmsutorus/homepage/commit/d252ede1fdab27638c66d640d75b4ee06ae2d867))
* product page added ([f36d46c](https://github.com/jmsutorus/homepage/commit/f36d46ced2d9cb63cd1832b5ec6e442d71cff6ef))
* **quick-links:** implement customizable quick links widget ([cd992c3](https://github.com/jmsutorus/homepage/commit/cd992c3f144e4f1eb65de30c1d2c339c23527977))
* **security:** add user data isolation across all database operations ([8adb7a1](https://github.com/jmsutorus/homepage/commit/8adb7a19d8f82c2c5bc7529f91b8cc237c7bdd4f))
* Set up SQLite database with schema and CRUD operations ([0216e60](https://github.com/jmsutorus/homepage/commit/0216e60d8f6fd4506645afa0a7b5a648ca3b5f63))
* **tasks:** add category system with management ui ([8dbcb92](https://github.com/jmsutorus/homepage/commit/8dbcb928cc43a9665ec71b1371632e43d8324f36))
* **tasks:** add user filtering and refactor daily components ([f808ba1](https://github.com/jmsutorus/homepage/commit/f808ba14ef93c2bd8c5ef9d6d7f13c7447d602ca))
* **ui:** add breadcrumb nav and command palette ([d9ed5c5](https://github.com/jmsutorus/homepage/commit/d9ed5c5e9b6bd6ed02aa674d05de6cf2ac928001))
* **ui:** add success feedback and task completion animations ([e388744](https://github.com/jmsutorus/homepage/commit/e38874413965e19cbc65e0308a37a139bde64292))
* **ui:** add tag autocomplete and related content suggestions ([6ab6eda](https://github.com/jmsutorus/homepage/commit/6ab6eda59ed669c9f646f411f20e7e0e970d32d7))
* **ux:** add progress animations and achievement confetti ([6a27afd](https://github.com/jmsutorus/homepage/commit/6a27afd99487fe75ded1fb8e26f659101538889e))
* **ux:** add templates, NLP input, and page transitions ([c530116](https://github.com/jmsutorus/homepage/commit/c530116415a7ad7612aee17d646f263bcbac765e))
* **year-in-review:** add yearly statistics and summary page ([8cea9cd](https://github.com/jmsutorus/homepage/commit/8cea9cd05d50aabb4281a0c090dcc088fd4d8c0d))
* **yearly:** add shareable year in review card ([dccdac3](https://github.com/jmsutorus/homepage/commit/dccdac37b970d2c4288d7dc645fd389ce2386b8e))


### Performance Improvements

* **calendar:** optimize rendering with lazy loading ([8a9b18c](https://github.com/jmsutorus/homepage/commit/8a9b18cb009d8e4e3c3d2685c4189605cbd3630b))
