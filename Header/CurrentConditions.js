import React, {Component, PropTypes} from 'react';
import ForecastController from '../ForecastController'
import XML2JS from 'xml2js';

class CurrentConditions extends Component {
  constructor(props) { //gives us acces to props, fires long before page load
    super(props) //assigns props to this.props
    this.affiliate = props.affiliate;
    this.forecast = new ForecastController(props.affiliate)

    this.state = {
      radarImg: 'http://aws.kotv.com/MorHtml5/kotv/ssite/110x62_new/main_anim.gif?' + Date.now()
    }

  }

  componentDidMount() {
      this.forecast.get((data)=>{
        this.setState(data)
      })
  }


  render() {
    return (
      <div className='gnm-current-conditions '>
        <div className='link-container hidden-xs hidden-sm text-right'>
          <a href='#' className={' hidden-xs hidden-sm hidden-md map-link' + (this.state.temp
            ? ''
            : ' hidden')/* on one occassion, this value was unset */}>{this.state.city}, {this.state.state}
            <span className='glyphicon glyphicon-map-marker' />
          </a>

        </div>
        <div className='pull-left' style={{width:'100px'}}>
          <img className='pull-left weather-icon-sm img-responsive' src={this.state.conditionIcon} />
          <span className={' current-temp temperature' + (this.state.temp
            ? ''
            : ' hidden')/* on one occassion, this value was unset */}>{this.state.temp}&deg;</span>
          <div>
            <span className='pull-right feels-like'>
              Feels like {this.state.feelsLike}&deg;</span>
          </div>
        </div>

        <a href='#' className='hidden-xs hidden-sm hidden-md'>
          <img className=' radar-img ' src={this.state.radarImg} alt='radar image' />
        </a>

      </div>
    )
  }
}

export default CurrentConditions;
