import React, { useContext } from 'react'
import { C } from 'deltachat-node/dist/constants'
import Message, { CallMessage } from './Message'
import { ScreenContext } from '../../contexts'
import { getLogger } from '../../../shared/logger'
import { openViewProfileDialog } from '../helpers/ChatMethods'
import { MessageType, DCContact } from '../../../shared/shared-types'
import { openMessageInfo } from './messageFunctions'

const log = getLogger('renderer/messageWrapper')

type RenderMessageProps = {
  message: MessageType
  conversationType: 'group' | 'direct'
}

export const MessageWrapper = (props: RenderMessageProps) => {
  return (
    <li>
      <RenderMessage {...props} />
    </li>
  )
}

export const RenderMessage = React.memo(
  (props: RenderMessageProps) => {
    const { message } = props
    const msg = message.msg
    const screenContext = useContext(ScreenContext)
    const { openDialog } = screenContext

    const onContactClick = async (contact: DCContact) => {
      openViewProfileDialog(screenContext, contact.id)
    }

    let new_props = {
      // onReply: message.onReply,
      onContactClick,
      onClickMessageBody: null as () => void,
    }

    const isSetupmessage = message.msg.isSetupmessage
    const isDeadDrop = message.msg.chatId === C.DC_CHAT_ID_DEADDROP
    if (isSetupmessage) {
      new_props.onClickMessageBody = () =>
        openDialog('EnterAutocryptSetupMessage', { message })
    } else if (isDeadDrop) {
      new_props.onClickMessageBody = () => {
        openDialog('DeadDrop', message)
      }
    }

    if (message.isInfo)
      return (
        <div
          className='info-message'
          onContextMenu={openMessageInfo.bind(null, message)}
          custom-selectable='true'
        >
          <p>{msg.text}</p>
        </div>
      )
    if (message.msg.viewType === C.DC_MSG_VIDEOCHAT_INVITATION)
      return <CallMessage {...props} {...new_props} />

    return <Message {...props} {...new_props} />
  },
  (prevProps, nextProps) => {
    const areEqual = prevProps.message === nextProps.message
    return areEqual
  }
)
