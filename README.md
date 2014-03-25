Reliefweb Disaster App
======================

Relief Web is an organization that tracks international disaster preparedness and response. This application combines Relief Web's new [REST API](http://labs.reliefweb.int/) with a custom-built [Twitter timeline-processing script](https://github.com/developmentseed/twitter-server) to give authoritative, real-time updates on an occuring disaster.

This application's goal is to give an example of what developers can build with the Relief Web API, as well as create a re-usable disaster-specific app that can be rolled out quickly to track a natural disaster.

*Accessing the Relief Web API*

[Current API docs here](http://apidoc.rwlabs.org/)

*How to run this application locally*

This application uses [Foundation](http://foundation.zurb.com/) for responsive grid and base styling, and [Backbone.js](http://backbonejs.org) as a javascript framework. CSS and JS files are combined and minified for production using [Grunt](http://gruntjs.com/installing-grunt), which requires [Node.js](http://nodejs.org/) and [NPM](http://www.joyent.com/blog/installing-node-and-npm/).

To download and set up this site on your local hard drive:

1. git clone git@github.com:developmentseed/reliefweb-disaster-app.git
2. cd reliefweb-disaster-app
3. npm install
4. grunt watch

You should now be able to run a web server and see this site from a modern browser.

***How to contribute***

Read more about [contributing to the development]() of this project.
