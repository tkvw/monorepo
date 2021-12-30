<script lang="ts">
  import { tokens$ } from '$lib/auth/tokens';
  import { useViewerQuery, useLoginMutation, usePostsQuery } from '$lib/generated';
  import { of, Subject } from 'rxjs';
  let authorized = false;

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<a href="page2">Page2</a>


