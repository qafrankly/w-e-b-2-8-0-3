import React, { Component } from 'react';
import {Schedule} from './UtilityBeltSchedule';

class UtilityBelt extends Component {
  constructor(props){
    super(props);
    this.affiliate = this.props.affliate;
    this.liveUrl =  this.affiliate == 'kotv' ? 'http://www.newson6.com/story/37339678/news-on-6-live-streams' : 'http://www.news9.com/story/37339700/news-9-live-streaming';
    this.twitterUrl = this.affiliate == 'kotv' ? 'https://twitter.com/NewsOn6' : 'https://twitter.com/News9';
    this.facebookUrl = this.affiliate == 'kotv' ? 'https://www.facebook.com/NewsOn6/' : 'https://www.facebook.com/News9';
    this.instagramUrl = this.affiliate == 'kotv' ? 'https://www.instagram.com/newson6kotv/' : 'https://www.instagram.com/news9/';
    this.youtubeUrl = this.affiliate == 'kotv' ? 'https://www.youtube.com/user/TheNewsOn6' : 'https://www.youtube.com/user/NEWS9OklahomaCity';

    if(this.props.affliate == 'kotv')
      this.schedule = Schedule.kotv;
    else
      this.schedule = Schedule.kwtv;
  }

  makeReadable(d){
    let text = d.toLocaleTimeString().split(' ');
    let letters = text[0].split('');
    letters.splice(-3);
    return letters.join('') + ' ' + text[1];
  }

  nextLive(){
    var now = new Date();
    var nextLiveDate = this.schedule[0];
    for (var i = 1; i < this.schedule.length; i++) {
      if(this.schedule[i].getTime() > now.getTime()){
        nextLiveDate = this.schedule[i];
        break;
      }
    }
    return this.makeReadable(nextLiveDate)
  }

  render(){
    return (<div className={'gnm-utility-belt ' +(this.props.schoolsClosed? 'schools-closed' : '')}>
      <div className='container'>
        <span className='next-live pull-left' style={{display: !this.props.live && !this.props.schoolsClosed? 'block': 'none'}}>
          <span className='fa fa-clock-o' />
          <a  href={this.liveUrl} >NEXT LIVE BROADCAST AT {this.nextLive()}</a>
        </span>
        <span className='next-live pull-left' style={{display: this.props.live? 'block': 'none'}}>
          <span className='animated-television' />
          <a  href={this.liveUrl } className='live-message'>
            <span style={{display: this.props.schoolsClosed? 'none' : ''}}>WATCH</span>
            <span> LIVE</span>
          </a>
        </span>
        <span className='closings pull-left'
          style={{display: this.props.schoolsClosed? 'block': 'none',
                  borderLeft: !this.props.live ? 'none' : '2px solid  #222222',
                  paddingLeft: !this.props.live ? '0px' : '10px'}}>

          <a href={this.props.schoolClosingUrl}>School Closings <i ><span className='unecessary'>Sponsored by Osage River Spirit Casino and Resort</span></i></a>
        </span>
        <span className='utilities pull-right'>

          <a href={this.facebookUrl}>
            <span className='fa fa-facebook' />
          </a>
          <a href={this.twitterUrl}>
              <span className='fa fa-twitter' />
          </a>

          <a href={this.instagramUrl}>
                <span className='fa fa-instagram' />
          </a>
          <a href={this.youtubeUrl}>
              <span className='fa fa-youtube' />
          </a>

        </span>

      </div>
    </div>)
  }
}

export default UtilityBelt;
