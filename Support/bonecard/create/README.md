## Gist format for creating a tutorial

Name | Format
-------- | ---------------
description | title: [ tutorial title ], description: [ tutorial description ]
File name | [ bonecard No. ] \_bonecard\_[ card type ]_[ card title ]

For example:

````json
{
  "description": "title: LED blink, description: this is tutorial description.",
  "public": true,
  "files": {
    "1_bonecard_html_Card 1": {
      "content": "String file contents"
    },
    "2_bonecard_code_Card 2": {
      "content": "String file contents"
    }
  }
}
````
