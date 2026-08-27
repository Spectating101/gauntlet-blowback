# Portal adapters

Blowback uses a deliberately thin adapter model.

`generic` understands field locators expressed as accessible labels, roles, placeholders, or explicit CSS selectors. `devpost`, `easychair`, and `openreview` initially alias the generic engine so opportunity manifests can be tested without prematurely encoding portal-specific assumptions.

A portal-specific adapter should only be added after a real FIRE opportunity demonstrates repeated friction that cannot be represented in the manifest.

Preferred locator order:

1. accessible role + visible name;
2. label;
3. placeholder;
4. explicit selector as last resort.

Do not encode final-submit clicks in adapters.
