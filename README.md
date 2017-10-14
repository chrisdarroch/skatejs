# Skate

[![Downloads per month](https://img.shields.io/npm/dm/skatejs.svg)](https://www.npmjs.com/package/skatejs)
[![NPM version](https://img.shields.io/npm/v/skatejs.svg)](https://www.npmjs.com/package/skatejs)
[![Build Status](https://travis-ci.org/skatejs/skatejs.svg?branch=master)](https://travis-ci.org/skatejs/skatejs)
[![Join the chat at https://gitter.im/skatejs/skatejs](https://badges.gitter.im/skatejs/skatejs.svg)](https://gitter.im/skatejs/skatejs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Semantic Release](https://img.shields.io/badge/semantic--release-%F0%9F%9A%80-ffffff.svg)](https://github.com/semantic-release/semantic-release)
[![OpenCollective](https://opencollective.com/skatejs/backers/badge.svg)](#backers)
[![OpenCollective](https://opencollective.com/skatejs/sponsors/badge.svg)](#sponsors)
[![Follow @skate_js on Twitter](https://img.shields.io/twitter/follow/skate_js.svg?style=social&label=@skate_js)](https://twitter.com/skate_js)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/skatejs.svg)](https://saucelabs.com/u/skatejs)

Skate is a functional abstraction over [the web component standards](https://github.com/w3c/webcomponents) that:

- Produces cross-framework compatible components
- Abstracts away common attribute / property semantics via `props`, such as attribute reflection and coercion
- Adds several lifecycle callbacks for responding to prop updates, rendering and more
- Provides a base set of [mixins](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/) that hook into renderers such as [@skatejs/renderer-preact](https://github.com/skatejs/renderer-preact).

## Anatomy of a Skate web component

At its core, Skate is about creating [Custom Elements](https://w3c.github.io/webcomponents/spec/custom/).
Skate provides a series of [mixin functions](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)
that enable you to control what your component can do.

For instance, Skate's main mixin, `withComponent`, is just a composition of all of Skate's other mixin behaviours:

* `withProps` -- the generated element will react to changes on their props or HTML attributes.
* `withChildren` -- the generated element will react to changes to its child elements.
* `withRenderer` -- the element can generate its own DOM and output it to a `renderRoot` (a `ShadowRoot` node by default).
* `withUnique` -- allows for naming the custom element through `is`.

Calling `withComponent()` gives you a Custom Element class constructor, which you can then extend to
define your own elements.

Every mixin accepts an optional `Element` constructor as its only parameter, which
allows you to extend virtually any element type in HTML!

### Rendering an element

As an example, let's create a simple greeting component...

```html
<x-hello>Bob</x-hello>
```

...such that when this element is rendered, the end-user will see `Hello, Bob!`.

We can define a Skate component that renders the contents of our Custom Element:

```js
import { withComponent } from 'skatejs';

const Component = withComponent();

class GreetingComponent extends Component {
  rendererCallback (renderRoot, renderCallback) {
    renderRoot.innerHtml = '';
    renderRoot.appendChild(renderCallback());
  }
  renderCallback () {
      let el = document.createElement('span');
      el.innerHTML = 'Hello, <slot></slot>!';
      return el;
  }
});

customElements.define('x-hello', GreetingComponent);
```

When this element is rendered, the DOM will look something like the following:

```html
<x-hello>
  #shadow-root
    <span>Hello, <slot></slot>!</span>
  Bob
</x-hello>
```

This is the utility that web components provide when using Custom Elements and the Shadow DOM.

### Watching element properties and attributes

We can create a Skate component that watches for HTML attribute changes on itself:

```js
import { props, withComponent } from 'skatejs';

const Component = withComponent();

class GreetingComponent extends Component {
  static props = {
    name: props.string
  }
  rendererCallback (renderRoot, renderCallback) {
    renderRoot.innerHtml = '';
    renderRoot.appendChild(renderCallback());
  }
  renderCallback ({ name }) {
      let el = document.createElement('span');
      el.innerHTML = `Hello, ${name}!`;
      return el;
  }
});

customElements.define('x-hello', GreetingComponent);
```

The resulting HTML when the element is rendered would look like this:

```html
<x-hello name="Bob">
  #shadow-root
    <span>Hello, Bob!</span>
</x-hello>
```

Now, whenever the `name` property or attribute on the greeting component changes,
the component will re-render.

### Making your own mixins

In the previous exampless, each component implements its own rendering behaviour.
Rather than re-defining it all the time, we can write a mixin and take advantage of
prototypal inheritance:

```js
import { props, withComponent } from 'skatejs';

const withDangerouslyNaiveRenderer = (Base = HTMLElement) => {
  return class extends Base {
      rendererCallback (renderRoot, renderCallback) {
        renderRoot.innerHtml = renderCallback();
      }
  }
};

const Component = withComponent(withDangerouslyNaiveRenderer());

class GreetingComponent extends Component {
  static props = {
    name: props.string
  }
  renderCallback ({ name }) {
    return `<span>Hello, {name}!</span>`;
  }
});

customElements.define('x-hello', GreetingComponent);
```

### Rendering using other front-end libraries

Because Skate provides a hook for the renderer, it can support just about
every modern component-based front-end library &mdash; React, Preact, Vue...
just provide a `renderCallback` to stamp out your component's HTML,
a `rendererCallback` to update the DOM with your HTML, and then it's all the same to Skate!

The Skate team have provided a few renderers for popular front-end libraries;
check the [Installing](#installing) section.

#### Using Skate with Preact

Instead of writing our own `rendererCallback`, we could use a library like
[Preact](https://preactjs.com/) to do the work for us. Skate provides a ready-made renderer for Preact;
here's how we would update our previous greeting component to use it:

```js
/** @jsx h */

import { props, withComponent } from 'skatejs';
import withRenderer from '@skatejs/renderer-preact';
import { h } from 'preact';

const Component = withComponent(withRenderer());

customElements.define('x-hello', class extends Component {
  static props = {
    name: props.string
  }
  renderCallback ({ name }) {
    return <span>Hello, {name}!</span>;
  }
});
```

Now that the greeting component is rendered via Preact, when it renders,
it only changes the part of the DOM that requires updating.

## Installing Skate

To use Skate on its own, just add it to your `package.json`:

```sh
npm install skatejs
```

To use Skate with another front-end library, you'll want to install that library itself,
along with a Skate renderer for it.

```sh
npm install skatejs @skatejs/renderer-[renderer] [renderer]
```

Where `[renderer]` is one of:

- [@skatejs/renderer-lit-html](https://github.com/skatejs/renderer-lit-html)
- [@skatejs/renderer-preact](https://github.com/skatejs/renderer-preact)
- [@skatejs/renderer-react](https://github.com/skatejs/renderer-react)
- Or any custom renderer!

## Polyfills

Skate builds upon the [Custom Elements](https://w3c.github.io/webcomponents/spec/custom/) and
[the Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) standards. Skate is
capable of operating without the Shadow DOM &mdash; it just means you don't get any
encapsulation of your component's HTML or styles.

Though most modern browsers support these standards, some still need polyfills to implement missing or inconsistent
behaviours for them.

For more information on the polyfills, see
[the web components polyfill documentation](https://github.com/webcomponents/webcomponentsjs).

## Browser Support

Skate supports all evergreens and IE11, and is subject to the browser support matrix of the polyfills.

## Backers
Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/skatejs#backer)]

<a href="https://opencollective.com/skatejs/backer/0/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/1/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/2/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/3/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/4/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/5/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/6/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/7/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/8/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/9/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/10/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/11/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/12/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/13/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/14/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/15/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/16/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/17/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/18/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/19/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/20/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/21/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/22/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/23/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/24/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/25/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/26/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/27/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/28/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/backer/29/website" target="_blank"><img src="https://opencollective.com/skatejs/backer/29/avatar.svg"></a>

## Sponsors
Become a sponsor and get your logo on our README on Github with a link to your site. [[Become a sponsor](https://opencollective.com/skatejs#sponsor)]

<a href="https://opencollective.com/skatejs/sponsor/0/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/1/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/2/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/3/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/4/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/5/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/6/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/7/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/8/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/9/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/10/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/11/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/12/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/13/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/14/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/15/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/16/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/17/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/18/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/19/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/20/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/21/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/22/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/23/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/24/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/25/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/26/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/27/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/28/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/skatejs/sponsor/29/website" target="_blank"><img src="https://opencollective.com/skatejs/sponsor/29/avatar.svg"></a>
