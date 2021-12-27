<script lang="ts">
import { goto } from '$app/navigation';

  import { viewer$, setViewer } from '$lib/auth/viewer';  
  import {useViewerQuery} from "$lib/generated";
  import { interval, BehaviorSubject, of } from 'rxjs';
  import {onDestroy} from "svelte"
import Index from './index.svelte';
  
  const viewerResponse$ = useViewerQuery(of({
    useInitialLoading: true
  }));
  $: if(!$viewerResponse$.loading){
    setViewer($viewerResponse$.data?.viewer?? undefined);
  }  
  $: if($viewer$.initialized){
    goto("/auth/login");
  }


</script>

{#if !$viewer$.initialized}
 Loading...
{:else}
  <slot></slot>
{/if}