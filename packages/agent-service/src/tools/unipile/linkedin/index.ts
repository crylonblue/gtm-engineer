import { registerTool } from "../../registry.js";
import { searchPeopleTool } from "./search-people.js";
import { searchCompaniesTool } from "./search-companies.js";
import { getProfileTool } from "./get-profile.js";
import { getCompanyProfileTool } from "./get-company-profile.js";
import { sendMessageTool } from "./send-message.js";
import { startChatTool } from "./start-chat.js";
import { listChatsTool } from "./list-chats.js";
import { getChatMessagesTool } from "./get-chat-messages.js";
import { sendInvitationTool } from "./send-invitation.js";
import { listInvitationsSentTool } from "./list-invitations-sent.js";
import { createPostTool } from "./create-post.js";
import { sendCommentTool } from "./send-comment.js";
import { sendReactionTool } from "./send-reaction.js";

registerTool(searchPeopleTool);
registerTool(searchCompaniesTool);
registerTool(getProfileTool);
registerTool(getCompanyProfileTool);
registerTool(sendMessageTool);
registerTool(startChatTool);
registerTool(listChatsTool);
registerTool(getChatMessagesTool);
registerTool(sendInvitationTool);
registerTool(listInvitationsSentTool);
registerTool(createPostTool);
registerTool(sendCommentTool);
registerTool(sendReactionTool);

export {
  searchPeopleTool,
  searchCompaniesTool,
  getProfileTool,
  getCompanyProfileTool,
  sendMessageTool,
  startChatTool,
  listChatsTool,
  getChatMessagesTool,
  sendInvitationTool,
  listInvitationsSentTool,
  createPostTool,
  sendCommentTool,
  sendReactionTool,
};
