import { Angular2WebpackPage } from './app.po';

describe('angular2-webpack App', function() {
  let page: Angular2WebpackPage;

  beforeEach(() => {
    page = new Angular2WebpackPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
