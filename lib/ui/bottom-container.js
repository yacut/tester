'use babel';

import { CompositeDisposable, Emitter } from 'atom'
import BottomStatus from './bottom-status'

export default class BottomContainer extends HTMLElement {
    createdCallback() {
        this.subscriptions = new CompositeDisposable
        this.emitter = new Emitter
        this.status = new BottomStatus

        this.subscriptions.add(this.emitter)
        this.subscriptions.add(atom.config.observe('tester.statusIconScope', iconScope => {
            this.iconScope = iconScope
            //this.status.count = this.tabs.get(iconScope).count
        }))
        this.subscriptions.add(atom.config.observe('tester.displayLinterStatus', visibiltiy => {
            this.status.visibility = visibiltiy
        }))
        this.appendChild(this.status)
    }
    dispose() {
        this.subscriptions.dispose()
        this.status = null
    }

    static create(activeTab) {
        const el = document.createElement('tester-bottom-container')
        el.activeTab = activeTab
        return el
    }
}
