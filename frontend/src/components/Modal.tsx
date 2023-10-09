import { Component, JSX } from 'solid-js';
import { t } from '../utils/locale';

export const Modal: Component<{
	children: JSX.Element;
	ref?: HTMLDialogElement;
}> = (props) => {
	return (
		<dialog class="modal" ref={props.ref}>
			<div class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					onClick={(e) =>
						(e.target.parentElement?.parentElement as HTMLDialogElement)?.close()
					}
				>
					✕
				</button>
				{props.children}
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>{t('close')}</button>
			</form>
		</dialog>
	);
};
