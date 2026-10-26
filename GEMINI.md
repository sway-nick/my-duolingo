# Project Directives & Coding Standards for English Breakfast

> **CRITICAL RULE #1: 33 LOCALES (NOT 17)**
> English Breakfast officially supports **EXACTLY 33 LOCALES**.
> Any reference to "17 languages" is an obsolete legacy assumption and is STRICTLY PROHIBITED.
> Whenever localizing any new feature, button, dialog, ad modal, or widget text, it MUST be translated for ALL 33 LOCALES without exception.

---

### The 33 Supported Locales
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
15. `ga` - Irish
16. `lv` - Latvian
17. `lt` - Lithuanian
18. `mt` - Maltese
19. `pt` (and `pt-br`) - Portuguese (Brazilian: *Dobrar XP*)
20. `sk` - Slovak
21. `sl` - Slovenian
22. `fi` - Finnish
23. `hr` - Croatian
24. `cs` - Czech
25. `sv` - Swedish
26. `et` - Estonian
27. `hi` - Hindi (India: *XP दोगुना करें*)
28. `ar` - Arabic
29. `id` - Indonesian
30. `vi` - Vietnamese
31. `th` - Thai
32. `ko` - Korean
33. `ja` - Japanese

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
