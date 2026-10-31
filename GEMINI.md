# Project Directives & Coding Standards for English Breakfast

> **CRITICAL RULE #1: 36 LOCALES (EXACTLY 36)**
> English Breakfast officially supports **EXACTLY 36 LOCALES** (31 core + `bn` Bengali + `fa` Persian/Farsi with RTL + `zh` Simplified Chinese + `ur` Urdu with RTL + `kk` Kazakh; Maltese `mt` and Irish `ga` permanently removed).
> Whenever localizing any new feature, button, dialog, ad modal, or widget text, it MUST be translated for ALL 36 LOCALES without exception.

> **CRITICAL RULE #2: STRICT PROHIBITION OF AUTONOMOUS APK / AAB BUILDS**
> **NEVER build an APK (`EnglishBreakfast.apk`) or AAB (`EnglishBreakfast.aab`) unless the USER EXPLICITLY ASKS FOR IT.**
> Proactive, automatic, or background builds of APK or AAB upon updating code, dictionary, or assets are **STRICTLY FORBIDDEN**.
> Only run APK/AAB build scripts when directly commanded by the user.

---

### The 36 Supported Locales
1. `ru` - Russian
2. `uk` - Ukrainian
3. `en` - English (US / UK)
4. `de` - German
5. `es` (and `es-mx`) - Spanish (Mexican / Latin American: *Duplicar XP*)
6. `fr` - French
7. `pl` - Polish
8. `tr` - Turkish
9. `it` - Italian
10. `ro` - Romanian
11. `bg` - Bulgarian
12. `hu` - Hungarian
13. `el` - Greek
14. `da` - Danish
15. `lv` - Latvian
16. `lt` - Lithuanian
17. `pt` (and `pt-br`) - Portuguese (Brazilian: *Dobrar XP*)
18. `sk` - Slovak
19. `sl` - Slovenian
20. `fi` - Finnish
21. `hr` - Croatian
22. `cs` - Czech
23. `sv` - Swedish
24. `et` - Estonian
25. `hi` - Hindi (India: *XP दोगुना करें*)
26. `bn` - Bengali
27. `ar` - Arabic
28. `fa` - Persian / Farsi (RTL)
29. `ur` - Urdu (RTL: *ڈبل XP*)
30. `id` - Indonesian
31. `vi` - Vietnamese
32. `th` - Thai
33. `ko` - Korean
34. `ja` - Japanese
35. `zh` - Chinese Simplified (*双倍经验*)
36. `kk` - Kazakh (*XP екі еселеу*)

---

### Key Regional Nuances
* **Brazil (pt / pt-BR):** Use native Brazilian gaming terminology (`Dobrar XP`, not European `Duplicar`).
* **Mexico (es / es-MX):** Use Latin American / Mexican gaming terminology (`Duplicar XP`).
* **India (hi):** Use grammatically natural Hindi (`XP दोगुना करें` / `XP दोगुना हो गया!`).

---

### AdMob & Unity Ads Mediation
* AdMob is integrated with Unity Ads Mediation (`com.google.ads.mediation:unity:4.12.5.0` & `com.unity3d.ads:unity-ads:4.12.5`).
* Double XP and Rewarded video events MUST register dual listeners:
  * `onRewardedVideoAdReward` AND `onRewarded`
  * `onRewardedVideoAdDismissed` AND `onDismissed`
  * `onRewardedVideoAdFailedToShow` AND `onFailedToShow`
* ProGuard rules must always preserve Unity and Google mediation classes.
* `app-ads.txt` must maintain direct seller verification for both Google AdMob and Unity Ads.

---

### Verification Workflow
* Always run `npm test` to verify all 60 quality gate tests pass.
* Always synchronize changes from `frontend/` (single source of truth) to `docs/` and root via `node scripts/build.cjs`.
