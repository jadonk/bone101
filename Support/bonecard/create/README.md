## Gist format for creating a tutorial

Name | Format
-------- | ---------------
description | [ tutorial description ]
public | true
File name | [ bonecard No. ] \_bonecard
bonecard.title | [bonecard title]
bonecard.type | html / code

#### Special files

Name | type
-------- | ------
0_bonecard_cover_card | Holds a Base64 encoded image or 'default' for the default cover
bonecard.json | A string of JSON object contains tutorial (title & description) and bonecard (title & type)

For example:

````json
{
  "description": "description of the tutorial",
  "public":true,
  "files": {
    "0_bonecard_cover_card": {
      "content": "default"
    },
    "1_bonecard_html_Card 1": {
      "content": "String file contents"
    },
    "2_bonecard_html_Card 2": {
      "content": "String file contents"
    },
    "bonecard.json": {
      "content": "{\"description\":\"description of the tutorial\",
       \"title\":\"LED Blink\"
       \"bonecards\":\"[{\"title\":\"string of card title\",\"type\":\"html\"}]\"
      }"
    }
  }
}
````
