<script lang="ts">
  import { useViewerQuery, useLoginMutation, usePostsQuery } from '$lib/generated';
  import { of, Subject } from 'rxjs';

  const viewer = useViewerQuery(
    of({
      useInitialLoading: true
    })
  );

  // const [login,loginResult] = useLoginMutation();

  $: {
    console.log($viewer);
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<!-- {#if $viewer.loading}
  Loading...
{:else}
  {$viewer.data.viewer?.email}
{/if}  -->
