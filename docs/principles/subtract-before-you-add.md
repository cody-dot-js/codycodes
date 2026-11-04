# Subtract before you add

Before you add a rule, an option, a component, or a layer, look for one to remove. A change that deletes the cause of a problem beats a change that adds a guard around it.

**Why:** Additions stack up, and each one must justify its place every time someone reads it. A rule that nobody follows is a bug in the rule.

**Applies to:** code, prose.

**Signs you missed it:**

- A new component beside an old one that does the same job.
- A CSS override that undoes a style that an earlier layer set.
- A workaround, a polyfill, or a config file whose reason is gone.
- A doc rule added beside an older rule that says the same thing.
- A post edit that adds the new fact and keeps the outdated statement.

**In this repo:** delete an unused export, file, or prop in the same change that makes it unused. When you edit a post, remove the outdated statement before you add the new one.

**Enforced by:** review. oxlint flags some unused code.
