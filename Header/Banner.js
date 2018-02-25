import React, {Component, PropTypes} from 'react';
import banners_fake from './Banner_Fake';
import UtilityBelt from './UtilityBelt';
import VideoPlayer from './VideoPlayer'
//import Ajax from './Ajax';

const hasLocalStorage = (function hasLocalStorage() {
  let uid = new Date();
  try {
    localStorage.setItem(uid, uid);
    localStorage.removeItem(uid);
    return true;
  } catch (e) {
    return false;
  }
})()

class Banner extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: false,
      alerts: [],
      collapsed: true,
      debug: false,
      schoolsClosed: false,
      schoolClosingUrl: '',
      notifications: 0,
      liveFeedSources: []
    }
    this.origin = props.affiliate == 'kotv' ? 'http://www.newson6.com' : 'http://www.news9.com'
    this.initTime = 0;
    this.affiliate = props.affiliate;
    this.cacheDuration = 60 * 1000;
    this.slideDelay = 10 * 1000;
    this.transitionSpeed = 600;
    this.bannerChecker = null;
    this.bannerSlider = null;
    this.UtilityBeltHeight = 30;
  }

  ajax = (url,callback) => {
    let req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function() {
        if (req.status === 200) {
            callback(req.response);
        } else {
            new Error(req.statusText);
        }
    };
    req.onerror = function() {
        new Error('Network error');
    };
    req.send();
  }

  componentWillMount(){

  }


  useOldCrapUrl= (rel) =>{
    /* Here is where it really sucks -- sometimes we don't get a url, when there are live streams */
    /* this is becase we sometimes get links that look like:
    "javascript:GNM.liveStream('http://www.newson6.com/Global/category.asp?C=202152&amp;BannerId=3268');
    http://kotv-lh.akamaihd.net/z/KOTV_1180@97915/manifest.f4m
    http://kotv-lh.akamaihd.net/i/KOTV_1180@97915/master.m3u8" */
    if(rel == '')
      return '#'
    if( rel.search(/javascript:/g) < 0)
      return this.origin + rel;
    return '#'
  }

  componentDidMount(){
    this.initTime = Date.now()
    if (this.state.debug)
      this.updateAlerts(banners_fake);
    else {
      this.getDataIfNeeded()
      this.bannerChecker = setInterval(() => {
        this.getDataIfNeeded()
      }, this.cacheDuration);
    }
    this.bannerSlider = setInterval(() => {
      this.slideBanner()
    }, this.slideDelay);
    window.onresize = this.makeSpaceForHeader;
    this.makeSpaceForHeader()
  }

  getDataIfNeeded() {
    this.ajax(`https://kotv.com/api/getBanners.aspx?station=${this.affiliate}&IsWeb=true`,(res)=>{
      this.updateAlerts(JSON.parse(res))
    })
  }

  updateAlerts(alerts) {
    let schoolsClosed = false;
    let schoolClosingUrl = '';
    let live = false;
    alerts.map((a, i) => {
      if (a.BannerTypeId == 1) {
        schoolsClosed = true;
        schoolClosingUrl = a.Link;
      }
      if (a.BannerTypeId == 5) {
        live = this.useOldCrapUrl(a.Link)
      }
    })

    alerts = alerts.filter(function(a) {
      return a.BannerTypeId != 1 //remove the school closings banner
    })
    alerts.map((a, i) => {
      a.activeOrder = i;
    })
    this.setState({
      alerts: alerts,
      active: alerts.length > 0
        ? true
        : false,
      schoolsClosed: schoolsClosed,
      schoolClosingUrl: schoolClosingUrl,
      live: live
    })
  }

  slideBanner() {
    if (!this.state.collapsed)
      return null
    this.setState(function(prevState) {
      if (prevState.alerts.length == 0)
        return
      let newalerts = prevState.alerts.map((el, i, array) => {
        el.activeOrder = el.activeOrder != 0
          ? el.activeOrder - 1
          : array.length - 1;
        return el
      })
      return {alerts: newalerts}
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.active != prevState.active || this.state.collapsed != prevState.collapsed)
      this.makeSpaceForHeader();
    }

  componentWillUnmount() {
    clearInterval(this.bannerChecker);
    clearInterval(this.bannerSlider);
    this.makeSpaceForHeader();
  }

  makeSpaceForHeader = () => {
    /* css transition for this effect can be found both in Banner.css and global.css */
    var banner_height = this.state.active
      ? (this.state.collapsed
        ? 40
        : this.state.alerts.length * 40)
      : 0;

    var headerHeight = 101;
    if (typeof document.getElementById('gnm-header-without-banner') == 'object') {
      headerHeight = document.getElementById('gnm-header-without-banner').offsetHeight;
    }
    let new_padding = (headerHeight + banner_height + this.UtilityBeltHeight + 8) + 'px';
    /* really hate touching the DOM, but I don't see any way out of this */
    if (document.getElementById('gnm-main-body'))
      document.getElementById('gnm-main-body').style.paddingTop = new_padding;
    /* for frankly layout only */
    if (document.querySelector('.PageGrid.PageBody.container'))
      document.querySelector('.PageGrid.PageBody.container').style.paddingTop = new_padding;
    }

  toggleCollapsed = (e)=> {
    if(e)
      e.preventDefault()
    this.setState((prevState) => {
      return {
        collapsed: !prevState.collapsed
      }
    })
  }

  startLiveFeed(a){
    if(typeof a.EncoderUrls != 'object')
      return
    let newSource = []

    if(a.EncoderUrls[0].EncoderUrlTypeTitle =="Mobile")
      newSource = [{src: a.EncoderUrls[0].Url,
                        type: 'application/x-mpegURL' }]
    if(a.EncoderUrls[1].EncoderUrlTypeTitle =="Mobile")
      newSource = [{src: a.EncoderUrls[1].Url,
                      type: 'application/x-mpegURL' }]

    this.setState({liveFeedSources: newSource,
                    collapsed: true})
  }

  animatedStyle = (a, i) => {
    if (this.state.collapsed) {
      if (this.state.alerts.length == 1) {
        return {};
      }
      let transformPercent = 0;
      let zIndex = '-1'
      if (a.activeOrder == this.state.alerts.length - 1) {
        transformPercent = 100;
        zIndex = '1';
      }
      if (a.activeOrder == 0) {
        zIndex = '1';
      }
      return {
        zIndex: (this.state.alerts.length - a.activeOrder).toString(),
        transition: 'z-index ' + 6 *this.transitionSpeed + 'ms linear,  transform ' + this.transitionSpeed + 'ms ease-in-out',
        transform: 'translate3d(0,' + transformPercent + '%,0)'
      }
    } else {
      return {
        opacity: '1',
        zIndex: (this.state.alerts.length - a.activeOrder).toString(),
        transition: 'z-index 0ms, transform ' + this.transitionSpeed + 'ms ease-in-out',
        transform: 'translate3d(0,' + 100 *a.activeOrder + '%,0)'
      }
    }
  }

  animatedClass = (a, i) => {
    if (this.state.collapsed == true)
      return 'alert-red';

    if (a.activeOrder % 2 == 1)
      return 'alert-dark-red';
    return 'alert-red';
  }

  wrapperStyle() {
    if (this.state.collapsed) {
      if (this.state.active > 0)
        return {
          height: 40 + this.UtilityBeltHeight + 'px'
        }
      else
        return {
          height: this.UtilityBeltHeight + 'px'
        }
      } else
      return {
        height: this.state.alerts.length*40 + this.UtilityBeltHeight + 'px'
      }
  }


  render() {
    return (
      <div className={'gnm-banner '}>
        <div className='gnm-banner-control' style={this.wrapperStyle()}>
          <div className='container '>
            <button className='show-all' onClick={(e)=> this.toggleCollapsed(e)} style={{
              display: this.state.alerts.length > 1
                ? 'block'
                : 'none'
            }}>
              <span className={'glyphicon glyphicon-chevron-up' + (this.state.collapsed
                ? ' collapsed'
                : '')} />
            </button>
            <div className='alert-container'>

              {this.state.alerts.map((a, i) => {
                return (
                  <div key={i} className={'item '} style={this.animatedStyle(a, i)} role='option'>
                    <div className={'alert ' + this.animatedClass(a, i) + (a.activeOrder == 0
                      ? ' active'
                      : '')} role='alert'>
                      <div className='line-clamp '>
                        <a href={this.useOldCrapUrl(a.Link)} onClick={()=>{this.toggleCollapsed();
                                                                           this.startLiveFeed(a)}} >
                          <span className=''>{a.Title}:</span>
                          <span>{' ' + a.Description}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })
            }


            </div>
          </div>
        </div>
        <UtilityBelt affliate={this.affiliate}
          schoolsClosed={this.state.schoolsClosed}
          schoolClosingUrl={this.state.schoolClosingUrl}
           live={this.state.live}
           style={{
          height: this.UtilityBeltHeight + 'px'
        }} />
      <VideoPlayer sources={this.state.liveFeedSources}
                  modal
                  autoplay
                  closeCallback={()=>{this.setState({liveFeedSources: []})}}/>
      </div>

    )
  }
}

export default Banner;
