# Solidity API

## EventUtils

### EmitPositionDecreaseParams

```solidity
struct EmitPositionDecreaseParams {
  bytes32 key;
  address account;
  address market;
  address collateralToken;
  bool isLong;
}
```

### EventLogData

```solidity
struct EventLogData {
  struct EventUtils.AddressItems addressItems;
  struct EventUtils.UintItems uintItems;
  struct EventUtils.IntItems intItems;
  struct EventUtils.BoolItems boolItems;
  struct EventUtils.Bytes32Items bytes32Items;
  struct EventUtils.BytesItems bytesItems;
  struct EventUtils.StringItems stringItems;
}
```

### AddressItems

```solidity
struct AddressItems {
  struct EventUtils.AddressKeyValue[] items;
  struct EventUtils.AddressArrayKeyValue[] arrayItems;
}
```

### UintItems

```solidity
struct UintItems {
  struct EventUtils.UintKeyValue[] items;
  struct EventUtils.UintArrayKeyValue[] arrayItems;
}
```

### IntItems

```solidity
struct IntItems {
  struct EventUtils.IntKeyValue[] items;
  struct EventUtils.IntArrayKeyValue[] arrayItems;
}
```

### BoolItems

```solidity
struct BoolItems {
  struct EventUtils.BoolKeyValue[] items;
  struct EventUtils.BoolArrayKeyValue[] arrayItems;
}
```

### Bytes32Items

```solidity
struct Bytes32Items {
  struct EventUtils.Bytes32KeyValue[] items;
  struct EventUtils.Bytes32ArrayKeyValue[] arrayItems;
}
```

### BytesItems

```solidity
struct BytesItems {
  struct EventUtils.BytesKeyValue[] items;
  struct EventUtils.BytesArrayKeyValue[] arrayItems;
}
```

### StringItems

```solidity
struct StringItems {
  struct EventUtils.StringKeyValue[] items;
  struct EventUtils.StringArrayKeyValue[] arrayItems;
}
```

### AddressKeyValue

```solidity
struct AddressKeyValue {
  string key;
  address value;
}
```

### AddressArrayKeyValue

```solidity
struct AddressArrayKeyValue {
  string key;
  address[] value;
}
```

### UintKeyValue

```solidity
struct UintKeyValue {
  string key;
  uint256 value;
}
```

### UintArrayKeyValue

```solidity
struct UintArrayKeyValue {
  string key;
  uint256[] value;
}
```

### IntKeyValue

```solidity
struct IntKeyValue {
  string key;
  int256 value;
}
```

### IntArrayKeyValue

```solidity
struct IntArrayKeyValue {
  string key;
  int256[] value;
}
```

### BoolKeyValue

```solidity
struct BoolKeyValue {
  string key;
  bool value;
}
```

### BoolArrayKeyValue

```solidity
struct BoolArrayKeyValue {
  string key;
  bool[] value;
}
```

### Bytes32KeyValue

```solidity
struct Bytes32KeyValue {
  string key;
  bytes32 value;
}
```

### Bytes32ArrayKeyValue

```solidity
struct Bytes32ArrayKeyValue {
  string key;
  bytes32[] value;
}
```

### BytesKeyValue

```solidity
struct BytesKeyValue {
  string key;
  bytes value;
}
```

### BytesArrayKeyValue

```solidity
struct BytesArrayKeyValue {
  string key;
  bytes[] value;
}
```

### StringKeyValue

```solidity
struct StringKeyValue {
  string key;
  string value;
}
```

### StringArrayKeyValue

```solidity
struct StringArrayKeyValue {
  string key;
  string[] value;
}
```

