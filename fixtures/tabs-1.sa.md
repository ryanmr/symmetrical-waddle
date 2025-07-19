import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs>
  <TabItem label="C">
    ```c
    #include <stdio.h>

    int main(void) {
      printf("Hello world!\n");
      return 0;
    }
    ```

  </TabItem>
  <TabItem label="C++">
    ```c++
    #include <iostream>

    int main(void) {
      std::cout << "Hello world!" << std::endl;
      return 0;
    }
    ```

  </TabItem>
</Tabs>
