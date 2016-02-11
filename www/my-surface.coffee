window.bit6 or = {}

# Surface for rendering video views
class bit6.MySurface
    constructor: (@phonertc) ->
        @counter = 0

    onVideo: (v, d, op) ->
        console.log 'Surface.video v=' + v + ' d=' + d + ' o=' + op
        # Added first video element
        if op > 0 and @counter is 0
            @_show v.parentNode
        # Removed last video element
        else if op < 0 and @counter is 1
            @_hide()
        # Keep track of the number of video elements
        @counter += op

    _show: (container) ->
        console.log 'RtcSurface show ' + container
        opts =
            container: container
            local:
                position: [0, 0]
                size: [100, 100]
        @phonertc.setVideoView opts

    _hide: ->
        console.log 'RtcSurface hide'
        @phonertc.hideVideoView()
