'use babel';

class BottomStatus extends HTMLElement{

  createdCallback() {
    this.classList.add('inline-block')
    this.classList.add('tester-highlight')

    this.iconSpan = document.createElement('span')
    this.iconSpan.classList.add('icon')
    this.appendChild(this.iconSpan)

    this.count = 0

    this.addEventListener('click', function() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'tester:next-failed')
    })
  }

  get visibility() {
    return !this.hasAttribute('hidden')
  }
  set visibility(value) {
    if (value) {
      this.removeAttribute('hidden')
    } else {
      this.setAttribute('hidden', true)
    }
  }

  get count() {
    return this._count
  }

  set count(Value) {
    this._count = Value
    if (Value) {
      this.classList.remove('status-success')
      this.iconSpan.classList.remove('icon-check')

      this.classList.add('status-error')
      this.iconSpan.classList.add('icon-x')

      this.iconSpan.textContent = Value === 1 ? '1 Issue' : `${Value} Issues`
    } else {
      this.classList.remove('status-error')
      this.iconSpan.classList.remove('icon-x')

      this.classList.add('status-success')
      this.iconSpan.classList.add('icon-check')

      this.iconSpan.textContent = 'No Issues'
    }
  }

}

module.exports = document.registerElement('tester-bottom-status', {prototype: BottomStatus.prototype})
