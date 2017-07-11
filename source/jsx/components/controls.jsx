/** @jsx React.DOM */

define([
    'react',
    'utils',
    'constants',
    'configs',
    'skylink',
    'router'
], function (
    React,
    Utils,
    Constants,
    Configs,
    Skylink,
    Router
) {

    var Controls = React.createClass({
        handleMCUClick: function(e) {
            Dispatcher.setMCU(e.target.checked);
        },
        componentDidUpdate: function() {
            var $mcu = document.getElementById('mcu');
            if($mcu) {
                $mcu.checked = this.props.state.room.useMCU;
            }
        },
        handleStartRoom: function() {
            var room = this.props.state.room.useMCU ? 'm' : '';
            room = room + Utils.uuid(6);
            Router.setRoute('/' + room);
        },
        handleLeaveRoom: function() {
            Skylink.leaveRoom();
            Router.setRoute('/');
        },
        handleVideoMute: function() {
            var user = this.props.state.users.filter(function (user) {
                return user.id === 0;
            })[0];
	        Skylink[user.videoMute ? 'enableVideo' : 'disableVideo']();
        },
        handleAudioMute: function() {
            var user = this.props.state.users.filter(function (user) {
                return user.id === 0;
            })[0];
	        Skylink[user.audioMute ? 'enableAudio' : 'disableAudio']();
        },
        handleRoomLock: function() {
            if(this.props.state.users.length < Configs.maxUsers) {
                Skylink[this.props.state.room.isLocked ? 'unlockRoom' : 'lockRoom']();
            }
        },
        handleScreenshare: function() {
            var user = this.props.state.users.filter(function (user) {
                return user.id === 0;
            })[0];

            if(!this.props.state.room.screensharing) {

                Dispatcher.sharescreen(true);

                Skylink.shareScreen(true, function (err) {
                    if (err) {
                        Dispatcher.sharescreen(false);
                    }
                });
            }
            else if(user.screensharing) {

                Dispatcher.sharescreen(false);

                Skylink.stopScreen();
            }
        },
        handleLinkClick: function (e) {
            e.target.setSelectionRange(0, e.target.value.length);
        },
        handleClose: function(e) {
            Dispatcher.toggleControls();
        },
        render: function() {
            var res = [];
            var user = this.props.state.users.filter(function (user) {
                return user.id === 0;
            })[0];

// main title of popup
           res.push(
                <div className="logo">Elm Chat</div>
                );

            if(this.props.state.state === Constants.AppState.FOYER) {
                res.push(
                    <button className="joinRoom mainControl" onClick={this.handleStartRoom}>
                        Start a new call
                    </button>
                    );

                res.push(
                    <div className="description">
                        <p>
                            
                        </p>
                        <p>
                            Just hit the &quot;Start a new call&quot; button below and share the link.<br /><br />
                        This video chat is made with ❤️ by <a href="https://www.elmgives.com" target="_blank">Elm</a>.
                        </p>
                    </div>
                    );

                // res.push(
                //     <div className="link">
                //         <input type="checkbox" id="mcu" name="mcu" onClick={this.handleMCUClick} /> <label for="mcu">Use Skylink Media Relay</label>
                //     </div>
                //     );
            }
            else if(this.props.state.state === Constants.AppState.IN_ROOM) {
                res.push(
                    <button className="leaveRoom mainControl" onClick={this.handleLeaveRoom}>
                        Leave this call
                    </button>
                    );

                res.push(
                    <div className="link">
                        Share this link to invite others into this call<br />
                        <input type="text" value={location.toString()} onClick={this.handleLinkClick} readOnly />
                    </div>
                    );

                res.push(
                    <div className="status">Status: {this.props.state.room.status}</div>
                    );

                if(this.props.state.room.status === Constants.RoomState.CONNECTED && user.stream != null) {
                    res.push(
                        <button id="videoMute" onClick={this.handleVideoMute} className={user.videoMute ? '' : 'on'} title="Mute/Unmute Video"></button>
                        );

                    res.push(
                        <button id="audioMute" onClick={this.handleAudioMute} className={user.audioMute ? '' : 'on'} title="Mute/Unmute Audio"></button>
                        );

                    res.push(
                        <button id="screenshare" onClick={this.handleScreenshare} className={user.screensharing ? 'on' : (this.props.state.room.screensharing || window.webrtcDetectedBrowser === 'opera' ? 'muted' : '')} title="Share your screen"></button>
                        );

                    res.push(
                        <button id="roomLock" onClick={this.handleRoomLock} className={this.props.state.room.isLocked ? '' : 'on'} title="Lock/Unlock Room"></button>
                        );

                }
            }

            return (
                <section id="controls">
                    <nav>
                        <button onClick={this.handleClose} className={this.props.state.state === Constants.AppState.IN_ROOM ? 'close' : ''}></button>
                        <button></button>
                        <button></button>
                    </nav>
                    <div>
                        {res}
                    </div>
                </section>
                )
        }
    });

    return Controls;
});
