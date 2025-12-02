
/**
 * Safely remove a child element from its parent
 */
export function safeRemoveChild(parent: Node, child: Node): boolean {
  try {
    if (!parent || !child) {
      return false;
    }
    
    if (!parent.contains(child)) {
      return false;
    }
    
    if (child.parentNode !== parent) {
      return false;
    }
    
    parent.removeChild(child);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safely clear all children from a container
 */
export function safeClearContainer(container: Node): void {
  try {
    if (!container || !container.parentNode) return;
    
    if (container instanceof Element) {
      container.innerHTML = '';
      return;
    }
    
    const children = Array.from(container.childNodes);
    for (const child of children) {
      try {
        if (child && child.parentNode === container) {
          container.removeChild(child);
        }
      } catch (childError) {
      }
    }
  } catch (error) {
    if (container instanceof Element) {
      try {
        container.innerHTML = '';
      } catch (innerError) {
      }
    }
  }
}

/**
 * Safely append a child element
 */
export function safeAppendChild(parent: Node, child: Node): boolean {
  try {
    if (parent && child) {
      parent.appendChild(child);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Safely create and append a script element
 */
export function createScriptElement(src: string, onLoad?: () => void, onError?: () => void): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.defer = true;
  
  if (onLoad) {
    script.onload = onLoad;
  }
  
  if (onError) {
    script.onerror = onError;
  }
  
  return script;
}

/**
 * Safely remove a script element
 */
export function removeScriptElement(script: HTMLScriptElement): boolean {
  if (!script || !script.parentNode) return false;
  
  try {
    if (script.parentNode.contains(script)) {
      script.parentNode.removeChild(script);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
