/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  var prev = null,
    curr = head,
    next = null;
  while (curr != null) {
    next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
};

var reverseList = function (head) {
  if (head == null || head.next == null) {
    return head;
  }
  const newHead = reverseList(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
};

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var oddEvenList = function (head) {
  if (head === null || head.next === null) {
    return head;
  }
  var odd = head,
    even = head.next,
    evenHead = head.next;
  while (even != null && even.next != null) {
    odd.next = odd.next.next;
    odd = odd.next;
    even.next = even.next.next;
    even = even.next;
  }
  odd.next = evenHead;
  return head;
};

/**
 * Definition for singly-linked list.
 */

function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}

/**
 * @param {ListNode} list1
 * @param {number} a
 * @param {number} b
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeInBetween = function (list1, a, b, list2) {
  var dummy = new ListNode(0, list1);
  var prev,
    curr = list1;
  for (var i = 1; i <= a; i++) {
    prev = curr;
    curr = curr.next;
  }
  for (var j = a; j <= b; j++) {
    curr = curr.next;
  }
  var tail = list2;
  while (tail.next != null) {
    tail = tail.next;
  }
  prev.next = list2;
  tail.next = curr;
  return dummy.next;
};

var list1 = new ListNode(0);
list1.next = new ListNode(1);
list1.next.next = new ListNode(2);
list1.next.next.next = new ListNode(3);
list1.next.next.next.next = new ListNode(4);
list1.next.next.next.next.next = new ListNode(5);

var list2 = new ListNode(10001);
list2.next = new ListNode(10002);
list2.next.next = new ListNode(10003);

mergeInBetween(list1, 3, 4, list2);

var insertionSortList = function (head) {
  // 1. 首先判断给定的链表是否为空，若为空，则不需要进行排序，直接返回
  if (head === null) {
    return head;
  }
  // 2. 链表初始化操作
  const dummyHead = new ListNode(0); // 引入哑节点
  dummyHead.next = head;
  let lastSorted = head, // 维护lastSorted为链表已经排好序的最后一个节点并初始化
    curr = head.next; // 维护curr 为待插入的元素并初始化

  // 3. 插入排序
  while (curr !== null) {
    if (lastSorted.val <= curr.val) {
      // 说明curr应该位于lastSorted之后
      lastSorted = lastSorted.next; // 将lastSorted后移一位,curr变成新的lastSorted
    } else {
      // 否则,从链表头结点开始向后遍历链表中的节点
      let prev = dummyHead; // 从链表头开始遍历 prev是插入节点curr位置的前一个节点
      while (prev.next.val <= curr.val) {
        // 循环退出的条件是找到curr应该插入的位置
        prev = prev.next;
      }
      // 以下三行是为了完成对curr的插入
      lastSorted.next = curr.next;
      curr.next = prev.next;
      prev.next = curr;
    }
    // 此时 curr 为下一个待插入的元素
    curr = lastSorted.next;
  }
  // 返回排好序的链表
  return dummyHead.next;
};

// 合并有序链表
var merge = function (head1, head2) {
  var dummy = new ListNode();
  var curr = dummy,
    h1 = head1,
    h2 = head2;
  while (h1 !== null && h2 !== null) {
    if (h1.val <= h2.val) {
      curr.next = h1;
      h1 = h1.next;
    } else {
      curr.next = h2;
      h2 = h2.next;
    }
    curr = curr.next;
  }
  // if (h1 !== null) {
  //   curr.next = h1;
  // }
  // if (h2 !== null) {
  //   curr.next = h2;
  // }
  // 有未合并完的，直接将链表末尾指向未合并完的链表即可
  curr.next = h1 !== null ? h1 : h2;
  return dummy.next;
};
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var sortList = function (head) {
  if (head === null || head.next === null) {
    return head;
  }
  var slow = head,
    fast = head.next;
  // 使用 fast,slow 快慢双指针法，奇数个节点找到中点，偶数个节点找到中心左边的节点
  while (fast !== null && fast.next !== null) {
    fast = fast.next.next;
    slow = slow.next;
  }
  var mid = slow.next;
  // 将链表切断
  slow.next = null;
  return merge(sortList(head), sortList(mid));
};

/**
 * @param {ListNode} head
 * @param {number} x
 * @return {ListNode}
 */
var partition = function (head, x) {
  var small = new ListNode(0);
  var smallHead = small;
  var large = new ListNode(0);
  var largeHead = large;
  while (head !== null) {
    if (head.val < x) {
      small.next = head;
      small = small.next;
    } else {
      large.next = head;
      large = large.next;
    }
    head = head.next;
  }
  large.next = null;
  small.next = largeHead.next;
  return smallHead.next;
};

/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
var swapNodes = function (head, k) {
  if (head === null || head.next === null) {
    return head;
  }
  var dummy = new ListNode(0, head);
  var kNodePre = dummy,
    lastKNodePre = dummy,
    slow = head,
    fast = head;
  // kNodePre指正数第 k 个节点前一个节点，即第 k - 1个节点
  for (var i = 1; i < k; i++) {
    kNodePre = fast;
    fast = fast.next;
  }
  // kNode指正数第 k 个节点
  var kNode = fast;
  // fast指针走到头时， slow指向倒数第 k 个节点
  // lastKNodePre指倒数第 k 个节点前一个节点
  while (fast !== null && fast.next !== null) {
    lastKNodePre = slow;
    slow = slow.next;
    fast = fast.next;
  }
  // 正数第 k 个节点 与 倒数第 k 个节点 是同一个时， 不用交换，直接返回; 如 head = [1,2,3,4,5], k = 3
  if (kNode === slow) {
    return dummy.next;
  } else if (kNode.next === slow) {
    // 两个节点相邻; 如 head = [1,2], k = 1
    kNode.next = slow.next;
    slow.next = kNode;
    kNodePre.next = slow;
  } else if (slow.next === kNode) {
    // 两个节点相邻; 如 head = [1,2], k = 2
    slow.next = kNode.next;
    kNode.next = slow;
    lastKNodePre.next = kNode;
  } else {
    var tmp = slow.next;
    kNodePre.next = slow;
    lastKNodePre.next = kNode;
    slow.next = kNode.next;
    kNode.next = tmp;
  }
  return dummy.next;
};

var swapNodes = function (head, k) {
  if (head === null || head.next === null) {
    return head;
  }
  var dummy = new ListNode(0, head);
  var kNodePre = dummy,
    kNode,
    lastKNode;
  // kNodePre指正数第 k 个节点前一个节点，即第 k - 1个节点
  for (var i = 1; i < k; i++) {
    kNodePre = kNodePre.next;
  }
  var slow = dummy,
    fast = kNodePre.next;
  // 此时slow指向倒数第 k-1 个节点
  while (fast.next != null) {
    fast = fast.next;
    slow = slow.next;
  }

  if (kNodePre != slow) {
    // kNode指正数第 k 个节点
    kNode = kNodePre.next;
    // lastKNode指向倒数第 k 个节点
    lastKNode = slow.next;
    slow.next = kNode;
    kNodePre.next = lastKNode;
    var tmp = lastKNode.next;
    lastKNode.next = kNode.next;
    kNode.next = tmp;
  }
  return dummy.next;
};

var swapNodes = function (head, k) {
  if (head === null || head.next === null) {
    return head;
  }
  var dummy = new ListNode(0, head);
  var curr = dummy,
    arr = [];
  while (curr !== null) {
    arr.push(curr);
    curr = curr.next;
  }
  [kNode, lastKNode] = [lastKNode, kNode];
  return dummy.next;
};

function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}
var list1 = new ListNode(1);
list1.next = new ListNode(2);
list1.next.next = new ListNode(3);
list1.next.next.next = new ListNode(4);
list1.next.next.next.next = new ListNode(5);

/**
 * @param {ListNode} head
 * @return {void} Do not return anything, modify head in-place instead.
 */
var reorderList = function (head) {
  if (head === null || head.next === null) {
    return head;
  }
  var list = [],
    curr = head;
  while (curr !== null) {
    list.push(curr);
    curr = curr.next;
  }
  var i = 0,
    j = list.length - 1;
  while (i < j) {
    list[i].next = list[j];
    i++;
    if (i == j) {
      break;
    }
    list[j].next = list[i];
    j--;
  }
  list[i].next = null;
};

/**
 * @param {ListNode} head
 * @return {void} Do not return anything, modify head in-place instead.
 */
var reorderList = function (head) {
  if (head === null || head.next === null) {
    return head;
  }
  var mid = middleNode(head);
  var l1 = head;
  var l2 = mid.next;
  mid.next = null;
  l2 = reverseList(l2);
  mergeList(l1, l2);
};

var mergeList = function (list1, list2) {
  var tmp1, tmp2;
  while (list1 != null && list2 != null) {
    tmp1 = list1.next;
    tmp2 = list2.next;

    list1.next = list2;
    list1 = tmp1;

    list2.next = list1;
    list2 = tmp2;
  }
};
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  var prev = null,
    curr = head,
    next = null;
  while (curr != null) {
    next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
};

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var middleNode = function (head) {
  if (head === null) {
    return null;
  }
  let slow = head,
    fast = head.next;
  while (fast !== null && fast.next !== null) {
    fast = fast.next.next;
    slow = slow.next;
  }
  return slow;
};

/**
 * @param {ListNode} head
 * @return {void} Do not return anything, modify head in-place instead.
 */
var reorderList = function (head) {
  if (head === null || head.next === null) {
    return head;
  }
  // 1. 找中点，使用 fast,slow 快慢双指针法，奇数个节点找到中点，偶数个节点找到中心左边的节点
  var slow = head,
    fast = head.next;
  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  // 2. 断开中点，反转后半部分
  var head2 = null,
    next = slow.next;
  slow.next = null;
  slow = next;
  while (slow != null) {
    next = slow.next;
    slow.next = head2;
    head2 = slow;
    slow = next;
  }

  // 3. 合并链表head和head2
  var curr = head;
  var curr2 = head2;
  while (curr != null && curr2 != null) {
    next = curr.next;
    curr.next = curr2;
    curr2 = curr2.next;
    curr.next.next = next;
    curr = next;
  }
};

function hotPotato(nameList, num) {
  var queue = new Queue();
  for (var i = 0; i < nameList.length; i++) {
    queue.enqueue(nameList[i]); // 加入队列
  }
  var eliminated = "";
  while (queue.size() > 1) {
    for (var i = 0; i < num; i++) {
      queue.enqueue(queue.dequeue()); // 从队列开头移 除一项，再将其添加到队列末尾
    }
    eliminated = queue.dequeue(); // 从队列中移除
    console.log(eliminated + "在击鼓传花游戏中被淘汰。");
  }
  return queue.dequeue();
}

var names = ["Aa", "Bb", "Cc", "Dd", "Ee"];
var winner = hotPotato(names, 7);
console.log("胜利者:" + winner);

// Cc在击鼓传花游戏中被淘汰。
// Bb在击鼓传花游戏中被淘汰。
// Ee在击鼓传花游戏中被淘汰。
// Dd在击鼓传花游戏中被淘汰。
// 胜利者:Aa

const sleepCb = (cb, time) => {
  setTimeout(cb, time);
};
sleepCb(() => {
  console.log("cb");
}, 1000);

// Promise
const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};
sleep(1000).then(() => {
  console.log("Promise");
});

// Generator
function* sleepGenerator(time) {
  yield new Promise((resolve) => setTimeout(resolve, time));
}
sleepGenerator(1000)
  .next()
  .value.then(() => {
    console.log("Generator");
  });

// async await
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
async function sleepAsync() {
  await sleep(1000);
  console.log("async");
}
sleepAsync();

var removeDuplicates = function (s, k) {
  if (s.length <= 1) {
    return s;
  }
  const stack = [];
  for (const ch of s) {
    let prev = stack.pop();
    if (!prev || prev[0] !== ch) {
      stack.push(prev);
      stack.push(ch);
    } else if (prev.length < k - 1) {
      stack.push(prev + k);
    }
  }
  return stack.join("");
};

this.removeAt = function (position) {
  //检查是否越界
  if (position > -1 && position < length) {
    var current = head,
      previous,
      index = 0;
    // 移除第一项
    if (position === 0) {
      head = current.next;
    } else {
      while (index++ < position) {
        previous = current;
        current = current.next;
      }
      //将previous与current下一项链接起来，跳过current，从而移除它
      previous.next = current.next;
    }
    // 更新列表的长度
    length--;
    return current.element;
  } else {
    return null;
  }
};

this.insert = function (position, element) {
  // 检查越界值
  if (position >= 0 && position <= length) {
    var node = new Node(element),
      current = head,
      previous,
      index = 0;
    if (position === 0) {
      // 在第一个位置添加
      node.next = current;
      head = node;
    } else {
      // 找到目标位置
      while (index++ < position) {
        previous = current;
        current = current.next;
      }
      node.next = current;
      previous.next = node;
    }
    // 更新列表的长度
    length++;
    return true;
  } else {
    return false;
  }
};

this.remove = function (element) {
  var index = this.indexOf(element);
  return this.removeAt(index);
};


/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
var addStrings = function (num1, num2) {
  let i = num1.length,
    j = num2.length,
    result = 0, 
    add = 0;  // 表示进位
  while (i || b) {
    a ? add += +num1[--i]: '';
    b ? add += num2[--j]: '';

    result = add % 10 + result;
    if (add > 9) add = 1
    else add = 0
  }
  if(add) result = 1 + result;
  return result
};