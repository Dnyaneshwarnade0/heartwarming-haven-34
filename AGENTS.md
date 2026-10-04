<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the legacy student portal under `public/app/` as the primary UI reached through the TanStack `/` redirect, because its existing scripts contain the complete school-management workflows.
- Extend the portal through the final `workspace-redesign.css` and `workspace-redesign.js` layers so original workflow scripts remain intact while the information architecture can evolve safely.
- Ship new portal features as their own `public/app/<feature>.{js,css}` layer registered in the `cloud.js` SCRIPTS list (e.g. `star-blacklist`), so original workflow scripts stay untouched and each feature can be rolled back independently.
