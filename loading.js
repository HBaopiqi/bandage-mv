'use strict';
(() => {
  const $=id=>document.getElementById(id),total=28; // 25 artworks, two fonts, one complete audio file.
  let completed=0,failed=false,prepared=false,entered=false;
  const fail=()=>{if(entered)return;failed=true;$('loadMessage').textContent='这段夜路还没装好。';$('loadHint').textContent='请检查网络后重新加载。';$('enterMV').disabled=true;$('enterMV').textContent='暂时无法进入';$('retryLoad').hidden=false;};
  window.MV_LOAD={
    done(){if(failed)return;completed++;const value=Math.min(99,Math.floor(completed/total*100));$('loadFill').style.width=value+'%';$('loadPercent').textContent=value+'%';$('loadProgress').setAttribute('aria-valuenow',String(value));},
    ready(){if(failed)return;prepared=true;clearTimeout(timeout);$('loadFill').style.width='100%';$('loadPercent').textContent='100%';$('loadProgress').setAttribute('aria-valuenow','100');$('loadMessage').textContent='画面与音乐，全部就绪。';$('enterMV').disabled=false;$('enterMV').textContent='进入 MV ↗';},
    fail
  };
  const timeout=setTimeout(()=>{if(!prepared&&!failed){$('loadMessage').textContent='还在加载，稍等一下…';$('loadHint').textContent='首次加载需要下载完整画面与音乐，请保持页面开启。';$('retryLoad').hidden=false;}},45000);
  $('retryLoad').addEventListener('click',()=>location.reload());
  $('enterMV').addEventListener('click',()=>{if(!prepared||failed)return;entered=true;$('watchPage').hidden=false;$('loadingHome').hidden=true;window.scrollTo(0,0);$('play').focus({preventScroll:true});$('start').click();});
  // A failed script/image must leave the entrance closed rather than show an empty player.
  window.addEventListener('error',event=>{if(event.target?.tagName==='SCRIPT'||event instanceof ErrorEvent)fail();},true);
  window.addEventListener('unhandledrejection',fail);
  const audio=$('audio');
  window.MV_AUDIO_READY=(async()=>{
    const response=await fetch(audio.dataset.src);if(!response.ok)throw new Error('Audio download failed');
    const blob=await response.blob();if(!blob.size)throw new Error('Empty audio');
    await new Promise((resolve,reject)=>{audio.addEventListener('loadeddata',resolve,{once:true});audio.addEventListener('error',reject,{once:true});audio.src=URL.createObjectURL(blob);audio.load();});
    window.MV_LOAD.done();
  })();
  window.MV_AUDIO_READY.catch(fail);
})();
