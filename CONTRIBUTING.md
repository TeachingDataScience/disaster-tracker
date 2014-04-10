## How to Contribute

### Articulate Your Needs

For non-developers who want to improve the site, it would be very helpful for you articulate your needs that pertain to using this prototype. To get the conversation going, you can start an issue in the [GitHub issue queue](https://github.com/developmentseed/reliefweb-disaster-app/issues). The discussion will be visible to the public.

### Send Pull Request

For those who would like to improve the prototype itself code- and organization-wise, comments and pull requests are welcome. Here are a few potential problems to start with.

#### Better Search Queries and Filtering

The ReliefWeb API has many options for searching and filtering through their reports. Although this application makes use of some of them, namely date start-/end-points and priority filtering, it is capable of more precise and powerful searches. See the [ReliefWeb API](http://reliefweb.int/help/api) docs for more information.

#### Better Demographic Information

To power the demographics tables and graphs, this application pulls from a static json file, obtained manually from a third-party data provider. Ideally, it would query demographic data from a live and up-to-date API that could differentiate queries by countries. This would eliminate the manual effort required here.
