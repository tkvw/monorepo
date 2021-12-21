<script lang="ts">
import { goto } from '$app/navigation';

  import Menu from '$lib/components/Menu.svelte';

  import { useViewerQuery } from '$lib/generated';
  import { of } from 'rxjs';
  const viewerResponse = useViewerQuery(
    of({
      useInitialLoading: true
    })
  );

  $: if(false === $viewerResponse.loading && null === $viewerResponse.data.viewer) goto("/auth/login");
</script>

{#if $viewerResponse.loading}
  Loading...
{:else}
<Menu />
<slot />
{/if}

