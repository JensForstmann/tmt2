import { Component, ComponentProps, JSX, splitProps } from 'solid-js';
import { t } from '../utils/locale';

export const Modal: Component<
	ComponentProps<'dialog'> & {
		children: JSX.Element;
	}
> = (props) => {
	const [local, others] = splitProps(props, ['children']);
	return (
		<dialog class="modal" {...others}>
			<div class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					onClick={(e) =>
						(e.target.parentElement?.parentElement as HTMLDialogElement)?.close()
					}
				>
					✕
				</button>
				{local.children}
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>{t('close')}</button>
			</form>
		</dialog>
	);
};
