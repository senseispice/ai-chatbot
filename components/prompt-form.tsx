'use client'

import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import { useActions, useUIState } from 'ai/rsc';
import { BotMessage, UserMessage } from './stocks/message';
import { AI } from '@/lib/chat/actions';
import { Button } from '@/components/ui/button';
import { IconArrowElbow, IconPlus } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';

export function PromptForm({
  input,
  setInput
}: {
  input: string;
  setInput: (value: string) => void;
}) {
  const router = useRouter();
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);

  const { submitUserMessage } = useActions();
  const [_, setMessages] = useUIState<typeof AI>();
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = event.target.files;
    if (files) {
      const uploadedFile = files[0];
      setFile(uploadedFile);
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{uploadedFile.name + ' has been successfully uploaded'}</UserMessage>
        }
      ]);
    }
  };

  const handleFileButtonClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  return (
    <div>
      <form
        ref={formRef}
        id="chat-form"
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();

          // Blur focus on mobile
          if (window.innerWidth < 600) {
            e.target['message']?.blur();
          }

          const value = input.trim();
          setInput('');
          if (!value) return;

          // Optimistically add user message UI
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: nanoid(),
              display: <UserMessage>{value}</UserMessage>
            }
          ]);

          // Submit and get response message
          const responseMessage = await submitUserMessage(value);
          console.log('first', responseMessage);
          setMessages(currentMessages => [...currentMessages, responseMessage]);
        }}
      >
        <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
                onClick={() => {
                  router.push('/new');
                }}
              >
                <IconPlus />
                <span className="sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
          <Textarea
            ref={inputRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            placeholder="Send a message."
            className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            name="message"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div className="absolute right-5 top-[13px] sm:right-4">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full bg-background p-0 sm:left-4"
              onClick={handleFileButtonClick}
            >
              <IconPlus />
              <span className="sr-only">Upload File</span>
            </Button>
            <input
              type="file"
              onChange={addFile}
              ref={hiddenFileInput}
              style={{ display: 'none' }} // Make the file input element invisible
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" disabled={input === ''}>
                  <IconArrowElbow />
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </form>
    </div>
  );
}
