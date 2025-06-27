<script setup lang="ts">

import './styles/vars.css'
import './styles/markdown-body.css'
import './styles/highlight-js.css'

import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

import MarkdownIt from 'markdown-it'
import MarkdownItHighlightjs from 'markdown-it-highlightjs'

interface DocumateProps {
  endpoint: string;
  placeholder?: string;
  predefinedQuestions?: string[];
  open?: boolean;
  onClose: () => void;
}

const props = withDefaults(defineProps<DocumateProps>(), {
  endpoint: '',
  placeholder: 'Ask a question...',
  predefinedQuestions: () => [],
  open: false,
  onClose: () => { console.warn('emit close') },
})

const isOpen = ref(props.open)
const query = ref<string>('')
const questions = ref<{ role: string; content: string; id: number }[]>([])
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
let selectionMade = ref(false);

let assistantId = 0
let isCmdPressed = false

function onSelect(item: string ): void {
  selectionMade.value = true
  startChat(item)
}

// markdown processor
const markdownToHtml = (content: string): string => {
  const markdown = new MarkdownIt()
    .use(MarkdownItHighlightjs)

  try {
    const html = markdown.render(content)
    return html
  } catch (err) {
    return content
  }
}

// fetch ChatGPT
async function startChat(question: string) {

  if (!question) {
    return
  }

  if (!props.endpoint) {
    console.error('Props endpoint is not provide')
    return
  }

  loading.value = true

  questions.value.push({ role: 'user', content: question, id: ++assistantId })

  try {
    const response = await fetch(props.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
    })

    loading.value = false

    async function streamToString(body: any, assistantId: number) {
      const reader = body?.pipeThrough(new TextDecoderStream()).getReader();
      while (reader) {
        let stream = await reader.read()
        if (stream.done) break
        const chunks = stream.value

        if (chunks) {
          const content = chunks
          if (!content) continue

          if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
          }

          const assistantIndex = questions.value.findIndex(q => q.role === 'assistant' && q.id === assistantId)

          if (assistantIndex === -1) {
            questions.value.push({ role: 'assistant', content, id: assistantId })
          } else {
            questions.value[assistantIndex].content += content
          }
        }
      }
    }
    streamToString(response.body, assistantId)
  } catch (err) {
    console.log(err)
  }
}

const keyEnter = (e: KeyboardEvent) => {
  if (selectionMade.value) {
    selectionMade.value = false
    query.value = ''
    return
  }
  e.preventDefault()
  startChat(query.value)
  scrollToBottom()
  query.value = ''
}

const filteredPredefinedQuestions = computed(() =>
  query.value === ''
    ? props.predefinedQuestions
    : props.predefinedQuestions.filter((item) => {
        return item.toLowerCase().includes(query.value)
      })
)

const handleKeydown = (e: KeyboardEvent) => {

  if (e.key === 'Meta') isCmdPressed = true;  // Cmd key on Mac

  if (isCmdPressed && e.key === '/') {
    isOpen.value = true;  // Open dialog
  }

  if (e.key === 'Escape') {
    isOpen.value = false;  // Close dialog
  }
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keyup', (event) => {
    if (event.key === 'Meta') isCmdPressed = false  // Cmd key on Mac
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('keyup', () => {})
})
</script>

<template>
<TransitionRoot :show="open" as="template" appear>
  <Dialog as="div" class="dialog" @close="onClose">
    <TransitionChild as="template" class="enter enter-from enter-to leave leave-from leave-to">
      <div class="transition-child-ref"></div>
    </TransitionChild>
    <div class="dialog-container">
      <TransitionChild as="template">
        <DialogPanel class="dialog-panel">
          <Combobox @update:modelValue="onSelect">
            <div class="chat-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="magnifying-glass-icon" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <ComboboxInput class="chat-input" :placeholder="placeholder" aria-autocomplete="false"  @change="query = $event.target.value" @keyup.enter="keyEnter" :value="query" autocomplete="off" />
            </div>
            <ComboboxOptions v-if="props.predefinedQuestions.length > 0 && !questions.length" static class="combobox-options">
              <li v-if="props.predefinedQuestions.length > 0">
                <ul class="combobox-options-container">
                  <ComboboxOption v-for="action in filteredPredefinedQuestions" :key="action" :value="action" as="template" v-slot="{ active }">
                    <li class="combobox-option" :class="{ active }">
                      <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="option-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                      </svg>
                      <span class="combobox-options-name">{{ action }}</span>
                    </li>
                  </ComboboxOption>
                </ul>
              </li>
            </ComboboxOptions>
            <div v-if="(props.predefinedQuestions.length === 0 && questions.length === 0)" class="result-not-found">
              <p class="result-not-found-text">I'm Philbot how's it going?</p>
            </div>

            <div static class="combobox-options" v-if="questions.length" ref="chatContainer">
              <ul class="question-anwser-section">
                <li class="question-anwser-item" v-for="(q, index) in questions" v-bind:key="index">
                  <div v-if="q.role === 'user'" class="question-role-user">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="question-role-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ q.content }}
                  </div>
                  <div v-else-if="q.role === 'assistant' && !q.content" class="result-not-found">
                    <p class="result-not-found-text">We couldn't find anything with that term. Please try again.</p>
                  </div>
                  <div
                    class="anwser-content"
                    v-else-if="q.role === 'assistant' && q.content"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="question-role-icon philbot-icon">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M6 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"/>
                    <path d="M12 2v2"/>
                    <path d="M9 12v9"/>
                    <path d="M15 12v9"/>
                    <path d="M5 16l4 -2"/>
                    <path d="M15 14l4 2"/>
                    <path d="M9 18h6"/>
                    <path d="M10 8v.01"/>
                    <path d="M14 8v.01"/>
                  </svg>
                  <div
                    class="markdown-body"
                    v-html="markdownToHtml(q.content)"
                  >
                  </div>
                  </div>
                </li>
                <li>
                  <div v-show="loading" class="loading">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="loading-spin">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>
                </li>
              </ul>
            </div>
            <div class="footer">
              <div class="kbd-wrap">
                <span class="kbd-text">Philbot is trained on the info here and powered by Grok AI.</span>
              </div>
            </div>
          </Combobox>
        </DialogPanel>
      </TransitionChild>
    </div>
  </Dialog>
</TransitionRoot>
</template>

<style lang="less" scoped>

input {
  outline: none;
}

input:focus {
  outline: none;
}

p {
  margin: 0;
  padding: 0;
}

ul {
  padding: 0;
  margin: 0;
}

.button-placeholder {
  display: none;
}

@media (min-width: 768px) {
  .button-placeholder {
    display: block;
  }
}

.enter {
  transition: opacity 200ms ease-out;
}

.enter-from {
  opacity: 0;
}

.enter-to {
  opacity: 1;
}

.leave {
  transition: opacity 100ms ease-in;
}

.leave-from {
  opacity: 1;
}

.leave-to {
  opacity: 0;
}

.transition-child-ref {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.dialog-container {
  position: fixed;
  z-index: 999999;
  overflow-y: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: var(--dm-mask-bg-color);
  padding: 1rem;

  @media (min-width: 640px) {
    padding: 1.5rem;
  }
  @media (min-width: 768px) {
    padding: 5rem;
  }
}

.dialog-panel {
  margin: 0 auto;
  overflow: hidden;
  border-radius: 0.75rem;
  max-width: 36rem;
  background-color: var(--dm-modal-bg-color);
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  @media (max-width: 768px) {
    margin-top: 2rem;
  }
}

.magnifying-glass-icon {
  position: absolute;
  top: 0.875rem;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--dm-text-color);
  pointer-events: none;
}

.chat-container {
  position: relative;
}

.chat-input {
  box-sizing: border-box;
  padding-right: 1rem;
  padding-left: 2.75rem;
  border-width: 0;
  width: 100%;
  height: 3rem;
  color: var(--dm-text-color);
  background-color: transparent;
  border-bottom: 1px solid var(--dm-divider-color);

  @media (min-width: 640px) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}

.chat-input::placeholder {
  font-size: 1rem;
}

.combobox-options {
  overflow-y: auto;
  padding: 1rem;
  max-height: 20rem;
  scroll-padding-top: 2.5rem;
  scroll-padding-bottom: 2.5rem;
  scroll-padding-bottom: 0.5rem;
  min-height: 5rem;
  list-style: none;
}

.combobox-option {
  display: flex;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  cursor: pointer;
  user-select: none;
}

.combobox-options-container {
  margin-top: 0.5rem;
  margin-left: -1rem;
  margin-right: -1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--dm-text-color);
}

.active {
  color: var(--dm-c-white);
  background-color: var(--dm-highlight-color);
}

.combobox-options-name {
  margin-left: 0.75rem;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading {
  padding: 1rem;
  padding-left: 2.6rem;
  display: flex;
  justify-content: left;
  align-items: center;
}

.loading-spin {
  animation: spin 1s linear infinite;
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
}

.option-icon {
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
}

.question-anwser-section {
  list-style: none;
  max-height: 20rem;
  font-size: 0.875rem;
  scroll-padding-top: 0.5rem;
  scroll-padding-bottom: 0.5rem;
  color: var(--dm-text-color);
}

.question-anwser-item {
  padding-top: 0.875rem;
  padding-bottom: 0.875rem;
}

.question-role-user {
  display: flex;
  gap: 1.2rem;
}

.question-role-icon {
  display: inline-block;
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
}

.philbot-icon {
  width: 1.4rem;
  height: 1.4rem;
}

.result-not-found {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 3.5rem;
  padding-bottom: 3.5rem;
  text-align: center;

  @media (min-width: 640px) {
    padding-left: 3.5rem;
    padding-right: 3.5rem;
  }
}

.result-not-found-text {
  margin-top: 0.5rem;
  color: var(--dm-text-color);
  font-size: 0.85rem;
}
.anwser-content {
  display: flex;
  gap: 1.5rem;
}

.markdown-body {
  border-width: 0;
  font-size: 0.875rem;
  line-height: 1.25rem;
  overflow-wrap: break-word;
  overflow-y: auto;
  color: var(--dm-text-color);
  list-style: auto;
}

.footer {
  display: flex;
  align-content: center;
  justify-content: space-between;
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
  padding-left: 1rem;
  padding-right: 1rem;
  flex-wrap: wrap;
  align-items: center;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--dm-text-color);
  border-top: 1px solid var(--dm-divider-color);
  @media (max-width: 454px) {
    justify-content: center;
  }
}

.kbd-wrap {
  display: flex;
  justify-content: center;
  align-content: center;
}

.kbd-text {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.kbd {
  display: flex;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  justify-content: center;
  align-items: center;
  border-radius: 0.25rem;
  border-width: 1px;
  width: 1.25rem;
  height: 1.25rem;
  font-weight: 600;

  @media (min-width: 640px) {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
}

.esc {
  width: 2rem;
}

.powered-by {
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: var(--dm-text-color);
  gap: 0.25rem;
  @media (max-width: 768px) {
    margin-top: 0.2rem;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

</style>