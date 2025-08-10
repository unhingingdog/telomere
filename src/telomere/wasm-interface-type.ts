type ParseDeltaSuccess = {
  type: "Success";
  cap: string;
};

type ParseDeltaNotClosable = {
  type: "NotClosable";
};

export type ParseResult = ParseDeltaSuccess | ParseDeltaNotClosable;
