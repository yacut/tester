'use babel';
/* @flow */

import BottomContainer from './ui/bottom-container'
import type { State } from './types'

export default class TesterView {
  /*::
  element: any;
  bottomContainer: BottomContainer;
  */

  constructor(state/*: State*/) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('tester');
    
    this.bottomContainer = BottomContainer.create(state.scope)

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The Tester package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}

