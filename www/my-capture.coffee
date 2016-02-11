window.bit6 or = {}

# WebRTC Capture connector
class bit6.MyCapture extends bit6.RtcCapture
    constructor: (@phonertc) ->
        super

    request: (opts, cb) ->
        console.log 'RtcCapture2 request: ' + JSON.stringify(opts)
        # Emit local video element placeholder
        if opts?.video
            console.log 'RtcCapture2 - create local video'
            @localEl = e = document.createElement 'div'
            @emit 'video', e, 1
        # Done!
        cb null

    stop: ->
        console.log 'RtcCapture2 stop'
        super
