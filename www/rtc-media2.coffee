window.bit6 or = {}

# WebRTC connector
class bit6.RtcMedia2 extends bit6.RtcMedia
    constructor: (@phonertc) ->
        super

    start: ->
        console.log 'RtcMedia2 start'
        p = @phonertc
        if @options.video
            opts =
                container: @options.containerEl
                local:
                    position: [0, 0]
                    size: [100, 100]
            p.setVideoView opts
        # TODO: should be called when we really inited everything...
        # Especially on Android the init takes a while
        @_done true

    stop: ->
        console.log 'RtcMedia2 stop'
        if @options.video
            @phonertc.hideVideoView();
