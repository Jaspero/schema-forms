import {Observable, shareReplay} from 'rxjs';

let instance: {
	iframe: HTMLIFrameElement;
	inst$: Observable<{
		init: (options: any) => Promise<void>
	}>
};

export function tinyInstance(iframe: HTMLIFrameElement) {
	if (instance && instance.iframe === iframe) {
		return instance.inst$;
	}

	instance = {
		iframe,
		inst$: new Observable(obs => {
			const sc = iframe.contentDocument.createElement('script');
    
			/**
			 * TODO: 
			 * Maybe allow for specifiying the path
			 */
			sc.src = '/tinymce.min.js';

			sc.onload = () => {
				obs.next(iframe.contentWindow['tinymce']);
				obs.complete();
			};

			iframe.contentDocument.head.appendChild(sc);
		})
			.pipe(
				shareReplay(1)
			) as any
	}

	return instance.inst$;
}