window.bit6 or = {}

# WebRTC connector
class bit6.Rtc2 extends bit6.Rtc
    constructor: (@phonertc) ->
         super

    # Init
    init: (@media, @outgoing, iceServers, @options) ->
        super


    # Start media engine (getUserMedia)
    # TODO: when do we call 'cb false' on error?
    start: ->
        console.log 'Rtc2 start', @options

        cfg =
            isInitiator: @outgoing
            streams:
                audio: @options.audio
                video: @options.video
        # TURN is usually the second server
        if @pcConfig.iceServers.length > 1
            s = @pcConfig.iceServers[1]
            cfg.turn =
                host: s.url
                username: s.username
                password: s.credential
        # Init PhoneRTC
        @session = new @phonertc.Session cfg
        # PhoneRTC wants to send a signaling message
        @session.on 'sendMessage', (data) =>
            console.log 'Rtc2.sess.send: ' + JSON.stringify(data)
            switch data.type
                when 'offer', 'answer'
                    # from super._setLocalAndSendOfferAnswer
                    @bufferedOfferAnswer =
                        type: data.type
                        sdp: data.sdp
                    @_maybeSendOfferAnswer()
                when 'candidate'
                    # We need 'm=' index. Seems to be in 'label'
                    # We patch the 'candidate' object
                    data.sdpMLineIndex = data.label
                    # Note that we wrap it into another object
                    # since this is what is expected in JS world
                    @_handleIceCandidate {candidate: data}
                when 'IceGatheringChange'
                    if data.state is 'COMPLETE'
                        @_handleIceCandidate {}
                when 'bye'
                    console.log ' - bye'
                # Internal PhoneRTC event, emitted when
                # Session has been created
                when '__set_session_key'
                    console.log 'Rtc2 - session key set'
                    #cb true

        @session.on 'answer', () =>
            console.log 'Rtc2.sess.answer'
        @session.on 'disconnect', () =>
            console.log 'Rtc2.sess.disconnect'

        @session.call()
        @isStarted = true

    # Stop media
    stop: ->
        @isStarted = false
        @session.close() if @session
        @session = null


    # Got a remote description (offer or answer)
    gotRemoteOfferAnswer: (msg) ->
        console.log "Rtc2.gotRemoteOfferAnswer: " + msg.type + ' data=' + JSON.stringify(msg)
        switch msg.type
            # Got remote 'offer' / 'answer'
            when 'offer', 'answer'
                @session.receiveMessage msg if @session

    # Got hangup from remote
    gotHangup: (msg) ->
        @stop()
