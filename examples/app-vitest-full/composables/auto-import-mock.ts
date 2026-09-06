export function useAutoImportedTarget() {
  return 'the original'
}

export function useAutoImportedNonTarget() {
  return 'the original'
}

export function useAutoImportSetupMocked() {
  return 'the original'
}

export function useAutoImportSetupOverridenMocked() {
  return 'the original'
}

export function useAutoImportedNestedTarget() {
  return useAutoImportedNestedTargetChild()
}

export function useAutoImportedNestedNonTarget() {
  return useAutoImportedNestedNonTargetChild()
}

export function useAutoImportNestedSetupMocked() {
  return useAutoImportNestedSetupMockedChild()
}

export function useAutoImportNestedSetupOverridenMocked() {
  return useAutoImportNestedSetupOverridenMockedChild()
}
