# InnoServe 2026 — Hardware-Splicer model-origin clarification gate

Date: 2026-09-23  
Route: `innoserve-2026-hardware-splicer`  
Target category: **ADIAI — 產業AI創新組 / Industrial AI Innovation**

## Why this gate exists

The organizer's 2026-08-27 update added a declaration clause stating that the submitted work has not used China-origin or China-backed open-source models (example given: DeepSeek), including through API/MCP-mediated AI training, inference or related use.

Hardware-Splicer has historical optional Qwen and DeepSeek integrations/evaluation artifacts in the broader repository.

The prepared InnoServe overview does not present those models as the competition system, but that is not enough to infer that the declaration can safely be signed. The scope of "本次參賽作品" must be clarified.

## Organizer clarification question

Use this wording without reframing the facts:

> We are preparing a university student entry for the Industrial AI Innovation category. The competition-specific version we would submit and demonstrate would not use Qwen, DeepSeek, or any other China-origin / China-backed model in its runtime, inference, training, API/MCP calls, demo, or submitted evidence. However, the larger upstream research repository contains historical optional experiments/integrations involving Qwen and DeepSeek that are not part of the competition build. Under the updated 2026-08-27 declaration, is such a separately evidenced competition build eligible, and can the team truthfully sign the declaration?

Do not omit the historical repository fact when asking.


## Official contact path

Verified from the current InnoServe site on 2026-09-23:

- contacts: 李小姐、蔡先生;
- phone: 02-2577-4249 ext. 925 / 879;
- email: `maris@mail.tca.org.tw`, `yuanhan@mail.tca.org.tw`;
- service hours: Monday-Friday 09:00-12:00 and 13:00-18:00 Taiwan time;
- official contact/source page: `https://innoserve.tca.org.tw/`;
- declaration update: `https://innoserve.tca.org.tw/News/Details/28`.

Use both published competition email addresses for the clarification unless one organizer asks to continue on a single thread.

## Paste-ready clarification email

Suggested subject:

`2026 InnoServe 產業AI創新組－8/27參賽切結書模型來源條款資格確認`

Suggested body:

> 李小姐、蔡先生您好，
>
> 我正在準備參加 2026 第31屆大專校院資訊應用服務創新競賽「產業AI創新組」，想先確認 8 月 27 日更新之參賽切結書第六點的適用範圍，避免在報名前對資格做錯誤解讀。
>
> 我們擬提交及展示的競賽版本不會使用 Qwen、DeepSeek，或其他來源自中國／具中資背景的模型；在競賽版本的執行環境、推論、訓練、API/MCP 呼叫、展示與提交之實驗證據中，也不會使用這些模型。
>
> 但此專案所屬的較大型研究程式庫中，過去曾保留一些非競賽版本、選擇性的 Qwen／DeepSeek 整合與實驗紀錄；這些歷史實驗不會包含在本次競賽版本，也不會用來產生本次提交內容或競賽成果。
>
> 想請問：若我們能以明確的 commit/tag、依賴與模型清單、執行設定及實驗紀錄，證明本次參賽版本完全未使用上述模型，則此情況是否符合 8/27 更新之切結書第六點，並可據實簽署該切結書？
>
> 若該條款也會將上游研究程式庫中的歷史、非競賽用途實驗視為「本次參賽作品」的一部分，也麻煩告知，我們會依主辦單位解釋決定是否報名。
>
> 謝謝您協助確認。

Do not shorten this into "we do not use DeepSeek." The historical optional experiments are the fact that requires clarification.

## Decision paths

### If organizer confirms a clean competition build is acceptable

Proceed only after creating an auditable submission boundary:

- exact competition commit/tag;
- dependency/provider inventory;
- runtime configuration;
- demo configuration;
- submitted documents;
- submitted video;
- evaluation traces used for competition claims;
- declaration-compatible model/provider list.

The competition build must not call or depend on prohibited models through API, MCP or other runtime paths.

Historical files outside the competition build should remain historical; do not delete them merely to create the appearance that they never existed.

### If organizer says historical use disqualifies the derived work

Do not submit Hardware-Splicer to this route.

Gauntlet should reallocate InnoServe to another portfolio asset only if that asset independently satisfies the same declaration and category requirements.

### If no unambiguous answer is obtained

Do not sign the declaration.

A deadline does not justify making an eligibility assertion we cannot support.

## Other verified route requirements

For ADIAI:

- enrolled undergraduate/master's/doctoral students are eligible;
- up to 8 students per team;
- **1-2 school advisers required**;
- online registration closes **2026-10-05 at 16:00 Taiwan time**;
- system overview: Word, BiauKai 14pt, no more than 5 pages, max 4 MB;
- student-status evidence required;
- 3-minute project video uploaded to YouTube;
- landscape team photo required;
- reviewed documents/video must preserve the competition's anonymity rules.

## Current HS route state

Gauntlet execution state: `RESEARCH_ONLY`  
Route-specific blocking gate: `COMPLIANCE_CLARIFICATION_REQUIRED`

This is not a downgrade of Hardware-Splicer. It is a route-specific external rule introduced after the original packet was prepared.

## Hard boundary

Do not:

- remove historical Qwen/DeepSeek evidence to hide prior work;
- claim those experiments never existed;
- sign the updated declaration based only on the fact that the current overview does not mention them;
- create a nominal "clean build" unless the organizer confirms that this interpretation satisfies the declaration.

The route fires only if both the adviser gate and the model-origin declaration can be satisfied truthfully.
