window.bit6 or = {}

# WebRTC connector
class bit6.MyRtc extends bit6.Rtc
    constructor: (@phonertc) ->
         super

    # Init
    init: (@outgoing, iceServers) ->
        super


    update: (capture, opts, remoteOpts) ->
        # Do not allow updating an existing session for now
        return if @session

        @options = opts
        console.log 'Rtc2.update' + JSON.stringify(@options) + ' outgoing=' + @outgoing

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
                    @_handleIceCandidate data
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

        # Prepares the PeerConnection. Calls createOffer() only if initiator
        @session.call()

    # Stop media
    stop: ->
        console.log 'Rtc2.stop'
        @session?.close()
        @session = null
        super


    # Got a remote description (offer or answer)
    gotRemoteOfferAnswer: (msg, capture) ->
        console.log "Rtc2.gotRemoteOfferAnswer: " + msg.type + ' msg=' + JSON.stringify(msg) + ' sess=' + @session
        switch msg.type
            # Got remote 'offer' / 'answer'
            when 'offer', 'answer'
                # TODO: Remove this SDP hack when upgrading to the new WebRTC native lib
                # THREE days of my life!!!
               # msg.sdp = msg.sdp.replace /UDP\/TLS\/RTP\/SAVPF/g, 'RTP/SAVPF'
                # Hacky way of checking if we have a remote video stream to show
                if msg.sdp.indexOf('m=video') > 0
                    # Set remote video element placeholder
                    e = document.createElement 'div'
                    @remoteEls['dummy'] = e
                    @emit 'video', e, 1
                # Pass the offer/answer to the native WebRTC lib
                @session.receiveMessage msg if @session

    # Got hangup from remote
    gotHangup: (msg) ->
        @stop()
