import { withComponent } from '../../../src';

let Component = withComponent();

class MyComponent extends Component {
    rendererCallback (renderRoot, renderCallback) {
      renderRoot.innerHtml = '';
      renderRoot.appendChild(renderCallback());
    }
    renderCallback () {
        let el = document.createElement('div');
        el.innerHTML = 'Hello, <slot></slot>!';
        return el;
    }
}

customElements.define('hello-simple', MyComponent);
