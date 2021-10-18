/**
 * Returns an array containing all the parent nodes of the given node
 * @param  {object} HTMLNode
 * @return {array} All parent nodes up to child of `document`
 */
export function getParentNodes(node) {
    const parentNodes = [];
    let currNode = node;

    while(currNode !== document) {
        parentNodes.push(currNode.parentNode);
        currNode = currNode.parentNode;
    }

    return parentNodes;
}