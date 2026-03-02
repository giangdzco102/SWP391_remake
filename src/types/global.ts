/* eslint-disable @typescript-eslint/no-explicit-any */
interface Metadata {
  current_page: number;
  page_size: number;
  total_items: number;
}

export interface Response<T> {
  statusCode: number;
  status: boolean;
  error: any[];
  data: T;
  accessToken: string;
  refreshToken: string;
  metadata?: Metadata;
  code?: string;
}
interface ClassifyIntentEvent {
  classify_intent?: {
    user_intent?: string;
    [key: string]: unknown;
  };
}

interface ClassifyPricingQueryTypeEvent {
  classify_pricing_query_type?: {
    pricing_query_type?: string;
    [key: string]: unknown;
  };
}

interface AnswerNormalQuestionEvent {
  answer_normal_question?: {
    [key: string]: unknown;
  };
}

interface ExtractLocationEvent {
  extract_location?: {
    location?: string;
    [key: string]: unknown;
  };
}

interface AskPropertyDetailsEvent {
  ask_property_details?: {
    [key: string]: unknown;
  };
}

interface ParseUserResponseEvent {
  parse_user_response?: {
    [key: string]: unknown;
  };
}

interface SearchLocalHanoiPriceEvent {
  search_local_hanoi_price?: {
    local_search_success?: boolean;
    [key: string]: unknown;
  };
}

interface GeneratePricingQueriesEvent {
  generate_pricing_queries?: {
    search_query?: string[];
    [key: string]: unknown;
  };
}

interface PricingWebResearchEvent {
  pricing_web_research?: {
    sources_gathered?: Array<{
      label?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
}

interface PricingReflectionEvent {
  pricing_reflection?: {
    [key: string]: unknown;
  };
}

interface FinalizePricingAnswerEvent {
  finalize_pricing_answer?: {
    [key: string]: unknown;
  };
}

// Legacy events for backward compatibility
interface GenerateQueryEvent {
  generate_query?: {
    search_query?: string[];
  };
}

interface WebResearchEvent {
  web_research?: {
    sources_gathered?: Array<{
      label?: string;
      [key: string]: unknown;
    }>;
  };
}

interface ReflectionEvent {
  reflection?: {
    [key: string]: unknown;
  };
}

interface FinalizeAnswerEvent {
  finalize_answer?: {
    [key: string]: unknown;
  };
}

export type BackendEvent =
  | ClassifyIntentEvent
  | ClassifyPricingQueryTypeEvent
  | AnswerNormalQuestionEvent
  | ExtractLocationEvent
  | AskPropertyDetailsEvent
  | ParseUserResponseEvent
  | SearchLocalHanoiPriceEvent
  | GeneratePricingQueriesEvent
  | PricingWebResearchEvent
  | PricingReflectionEvent
  | FinalizePricingAnswerEvent
  | GenerateQueryEvent
  | WebResearchEvent
  | ReflectionEvent
  | FinalizeAnswerEvent;

export enum ModalType {
  AGENT = "agent",
  EASY_AGENT = "easy_agent",
}
