import React, {Component} from 'react';
import Banner from './Banner';
import MobileMegaNav from './MobileMegaNav';
import CurrentConditions from './CurrentConditions';


class Header extends Component {
  constructor(props) {
    super(props);
    this.nav = props.nav;
    this.stationID = props.affiliate === 'kwtv'
      ? 2
      : 1; //Dont beleive this has been set yet
    this.affiliate = props.affiliate;
    this.origin = props.affiliate == 'kotv' ? 'http://www.newson6.com/' : 'http://www.news9.com';
    this.advertiseUrl = props.affiliate =='kotv' ? 'http://www.newson6.com/category/121047/advertise-on-the-news-on-6' : 'http://www.news9.com/category/120574/advertising-news-9';
    /* this sucks frankly can't deal with svgs yet*/
    this.stackedLogoUrl = props.affiliate == 'kotv'
      ? 'https://ftpcontent.worldnow.com/kotv/test/don/build/img/n6-stacked-logo.svg'
      : 'https://ftpcontent.worldnow.com/kotv/test/don/build/img/n9-stacked-logo.svg';
    this.otsLogoUrl = props.affiliate == 'kotv'
      ? 'https://ftpcontent.worldnow.com/kotv/test/don/build/img/n6logo.svg'
      : 'https://ftpcontent.worldnow.com/kotv/test/don/build/img/n9logo.svg';
    this.navigation_data = props.cache;
    this.state = {
      navItems: [],
      megaNavItems: [],
      mobileMegaNavItems: [],
      mobileMegaNavOpen: false
    }
  }

  componentDidMount(){
    if( typeof window == 'object' ){
      this.createHeaderAd();
    }

  }

  createHeaderAd(){
    var script = document.createElement('script');

    script.onload = function() {
      window.gptadslots = [];
      window.googletag = window.googletag || {
        cmd: []
      };

      googletag.cmd.push(function() {
        //Adslot 1 declaration
        gptadslots.push(googletag.defineSlot('/43459271/loc-desktop/kotv/web/sumo', [
            [728, 90]
          ], 'div-gpt-ad-5410047-1')
          .addService(googletag.pubads()));
        //Adslot 2 declaration
        gptadslots.push(googletag.defineSlot('/43459271/loc-desktop/kotv/m-web/sumo', [
            [320, 50]
          ], 'div-gpt-ad-5410047-2')
          .addService(googletag.pubads()));
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
      });
      window.googletag.cmd.push(function() {googletag.display('div-gpt-ad-5410047-1')  }); //large header ad
      googletag.cmd.push(function() { googletag.display('div-gpt-ad-5410047-2'); });

    }

    script.src = "https://www.googletagservices.com/tag/js/gpt.js";
    document.getElementsByTagName('head')[0].appendChild(script);
  }


  componentWillMount() {
    this.buildState(this.nav)

  }

  buildState(navs) {
    let navItems = [];
    let megaNavItems = [];
    let mobileMegaNavItems = [];
    navs.map(function(item, i) {
      if (typeof item.subItems !== 'undefined' && item.title !== 'About Us' && item.title !== 'Video' && item.title != 'Contests' && item.title !== 'Home') {
        megaNavItems.push(item);
      }
      if (typeof item.subItems !== 'undefined' && item.title !== 'Home')
        mobileMegaNavItems.push(item);
      if (item.title !== 'About Us' && item.title !== 'Home') {
        navItems.push(item);
      }
    });
    this.setState({navItems: navItems, megaNavItems: megaNavItems, mobileMegaNavItems: mobileMegaNavItems});
  }

  toggleMobileMegaNav = () => {
    this.setState({
      mobileMegaNavOpen: !this.state.mobileMegaNavOpen
    })
  }
  /* NOTE: element styles here are for IE */
  render() {
    return (
      <div className='gnm-header'>
        <Banner affiliate={this.affiliate}/>
        <div id='gnm-header-without-banner'>
          <div className='container'>
            <div className='pull-left'>
              <button onClick={this.toggleMobileMegaNav.bind(this)} className={'dark-icon-bar-container ' + (this.state.mobileMegaNavOpen
                ? 'active'
                : '')}>
                <div className='dark-icon-bar'/>
                <div className='dark-icon-bar'/>
                <div className='dark-icon-bar'/>
              </button>
            </div>
            <div className='pull-left '>
              <img src={this.otsLogoUrl} className='big-ots img-responsive'/>
            </div>
            <div className='pull-left visible-lg-block visible-md-block ' style={{width:'80px'}}>
              <a href={this.origin}>
                <img src={this.stackedLogoUrl} className='logo-stacked '/>
              </a>
            </div>
            <div className='pull-left visible-xs-block visible-sm-block'>
              <a href={this.origin}>
                <img src={this.otsLogoUrl} className='logo-ots img-responsive'/>
              </a>
            </div>
            <div className='pull-left visible-lg-block' >
              <div className="ad728" id='div-gpt-ad-5410047-1' />
            </div>
            <div className='pull-left visible-md-block'>
              <a href={this.advertiseUrl}>
                <img className='ad640'  src='http://kotv.imagesdua1.worldnow.com/images/14076158_G.jpg'/>
              </a>

            </div>
            <div className='pull-left visible-sm-block'>
              <div className='ad320' id='div-gpt-ad-5410047-2'/>
            </div>
            <div className='pull-right' >
              <CurrentConditions affiliate={this.affiliate}/>
            </div>
          </div>
        </div>
        <MobileMegaNav affiliate={this.affiliate}
          items={this.state.mobileMegaNavItems}
           open={this.state.mobileMegaNavOpen}
           toggle={this.toggleMobileMegaNav}/>
      </div>
    );
  }
}

export default Header;
