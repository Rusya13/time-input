
let React            = require( 'react' );
let isTwelveHourTime = require( './lib/is-twelve-hour-time' );
let replaceCharAt    = require( './lib/replace-char-at' );
let getGroupId       = require( './lib/get-group-id' );
let getGroups        = require( './lib/get-groups' );
let adder            = require( './lib/time-string-adder' );
let caret            = require( './lib/caret' );
let validate         = require( './lib/validate' );
import PropTypes from 'prop-types';


let Component = React.Component;

class TimeInput extends Component {

    constructor( props ) {
        super( props )
        this.state = {}
    }

    render() {
        let className = 'TimeInput';
        if ( this.props.className ) {
            className += (' ' + this.props.className)
        }
        return (
            <div className={className}>
                <input
                    className='TimeInput-input'
                    ref={( input ) => { this.input = input }}
                    type='text'
                    value={this.format( this.props.value )}
                    onChange={this.handleChange}
                    onBlur={this.handleBlur}
                    onKeyDown={this.handleKeyDown}
                />
            </div>
        )
    }


    format( val ) {
        if ( isTwelveHourTime( val ) ) val = val.replace( /^00/, '12' )
        return val.toUpperCase()
    }


    componentDidMount() {
        this.mounted = true
    }


    componentWillUnmount() {
        this.mounted = false
    }


    componentDidUpdate() {
        var index = this.state.caretIndex
        if ( index || index === 0 ) caret.set( this.input, index )
    }


    handleBlur=()=> {
        if ( this.mounted ) this.setState( { caretIndex: null } )
    }


    handleEscape=()=> {
        if ( this.mounted ) this.input.blur()
    }


    handleTab =( event )=> {
        let start   = caret.start( this.input )
        let value   = this.props.value
        let groups  = getGroups( value )
        let groupId = getGroupId( start )
        if ( event.shiftKey ) {
            if ( !groupId ) return
            groupId--
        } else {
            if ( groupId >= (groups.length - 1) ) return
            groupId++
        }
        event.preventDefault()
        let index = groupId * 3
        if ( this.props.value.charAt( index ) === ' ' ) index++
        if ( this.mounted ) this.setState( { caretIndex: index } )
    }


    handleArrows=( event )=> {
        event.preventDefault()
        let start  = caret.start( this.input )
        let value  = this.props.value
        let amount = event.which === 38 ? 1 : -1
        if ( event.shiftKey ) {
            amount *= 2
            if ( event.metaKey ) amount *= 2
        }
        value = adder( value, getGroupId( start ), amount )
        this.onChange( value, start )
    }


    handleBackspace =( event )=> {
        event.preventDefault()
        let defaultValue = this.props.defaultValue
        let start        = caret.start( this.input )
        let value        = this.props.value
        let end          = caret.end( this.input )
        let diff         = end - start
        if ( !diff ) {
            if ( value[ start - 1 ] === ':' ) start--
            value = replaceCharAt( value, start - 1, defaultValue.charAt( start - 1 ) )
            start--
        } else {
            while ( diff-- ) {
                if ( value[ end - 1 ] !== ':' ) {
                    value = replaceCharAt( value, end - 1, defaultValue.charAt( end - 1 ) )
                }
                end--
            }
        }
        this.onChange( value, start )
    }


    handleForwardspace =( event )=> {
        event.preventDefault()
        let defaultValue = this.props.defaultValue
        let start        = caret.start( this.input )
        let value        = this.props.value
        let end          = caret.end( this.input )
        let diff         = end - start
        if ( !diff ) {
            if ( value[ start ] === ':' ) start++
            value = replaceCharAt( value, start, defaultValue.charAt( start ) )
            start++
        } else {
            while ( diff-- ) {
                if ( value[ end - 1 ] !== ':' ) {
                    value = replaceCharAt( value, start, defaultValue.charAt( start ) )
                }
                start++
            }
        }
        this.onChange( value, start )
    }


    handleKeyDown=( event )=> {
        if ( event.which === 9 ) return this.handleTab( event )
        if ( event.which === 38 || event.which === 40 ) return this.handleArrows( event )
        if ( event.which === 8 ) return this.handleBackspace( event )
        if ( event.which === 46 ) return this.handleForwardspace( event )
        if ( event.which === 27 ) return this.handleEscape( event )
    }


    isSeparator( char ) {
        return /[:\s]/.test( char )
    }


    handleChange=( event )=> {
        let value    = this.props.value;
        let newValue = this.input.value;
        newValue += value.substr( newValue.length, value.length );
        let diff     = newValue.length - value.length;
        let end      = caret.start( this.input );
        let insertion;
        event.preventDefault();
        if ( diff > 0 ) {
            let start = end - diff;
            insertion = newValue.slice( end - diff, end );
            while ( diff-- ) {
                let oldChar = value.charAt( start );
                let newChar = insertion.charAt( 0 );
                if ( this.isSeparator( oldChar ) ) {
                    if ( this.isSeparator( newChar ) ) {
                        insertion = insertion.slice( 1 );
                        start++
                    } else {
                        start++;
                        diff++;
                        end++
                    }
                } else {
                    value     = replaceCharAt( value, start, newChar );
                    insertion = insertion.slice( 1 );
                    start++
                }
            }
            newValue = value
        }
        if ( validate( newValue ) ) {
            this.onChange( newValue, end )
        } else {
            let caretIndex = this.props.value.length - (newValue.length - end);
            if ( this.mounted ) this.setState( { caretIndex: caretIndex } )
        }
    }


    onChange =( str, caretIndex )=> {
        if ( this.props.onChange ) this.props.onChange( this.format( str ) );
        if ( this.mounted && typeof caretIndex === 'number' ) this.setState( { caretIndex: caretIndex } )
    }
}

TimeInput.defaultProps = {
    value:        '12:00 AM',
    defaultValue: '00:00:00:000 AM'
};

TimeInput.propTypes = {
    className:    PropTypes.string,
    value:        PropTypes.string,
    onChange:     PropTypes.func,
    defaultValue: PropTypes.string
};


module.exports = TimeInput;

