'use babel';

/* flow*/
import OutputView from './views/output-view';

let view = null;

export function getView() {
  if (view === null) {
    view = new OutputView();
    atom.workspace.addBottomPanel({
      item: view,
    });
    view.hide();
  }
  return view;
}

export function create() {
  if (view != null) {
    view.reset();
  }
  return getView();
}
