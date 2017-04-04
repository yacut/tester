'use babel';

/* @flow*/

import React from 'react';
import ReactDOM from 'react-dom';

export default class StatusBarTile {
  logsCount: Object;
  item: ?any;

  constructor() {
    this.logsCount = {
      errorCount: 0,
      warningCount: 0,
    };
  }

  _onAllMessagesDidUpdate() : void {
    this.render();
  }

  render(): void {
    if (this.item) {
      ReactDOM.render(<StatusBarTileComponent {...this.logsCount} />, this.item);
    }
  }

  dispose() {
    if (this.item) {
      ReactDOM.unmountComponentAtNode(this.item);
      this.item = null;
    }
  }
}

type Props = {
  errorCount: number,
  warningCount: number,
};

class StatusBarTileComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any).onClick = this.onClick.bind(this);
  }

  render() {
    return (
      <span>
        <a>test</a>
      </span>
    );
  }

  onClick(): void {
    const target = atom.views.getView(atom.workspace);
    atom.commands.dispatch(target, 'nuclide-diagnostics-ui:toggle-table');
  }
}
