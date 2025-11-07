import React from 'react';

interface QuickRepliesProps {
  replies: string[];
  onSendReply: (reply: string) => void;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onSendReply }) => {
  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="py-2">
      <div className="flex flex-wrap items-center justify-start gap-2">
        {replies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onSendReply(reply)}
            className="px-4 py-2 bg-white border border-brand-primary text-brand-primary rounded-full text-sm font-medium hover:bg-brand-primary hover:text-white transition-colors animate-fade-in-up"
            style={{ animationDelay: `${index * 75}ms`}}
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
};