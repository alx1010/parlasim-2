from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

import undetected_chromedriver as uc

from selenium_stealth import stealth

import time

import csv

t = 2

user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.140 Safari/537.36"
chrome_options = uc.ChromeOptions()
chrome_options.add_argument('--headless=new')
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("user-agent={}".format(user_agent))
driver = uc.Chrome(options=chrome_options)
#stealth(driver,
#        languages=["en-US", "en"],
#        vendor="Google Inc.",
#        platform="Win32",
#        webgl_vendor="Intel Inc.",
#        renderer="Intel Iris OpenGL Engine",
#        fix_hairline=False
#        )

p = ''
z = ''

def getValues():
    titles = driver.find_elements(By.CLASS_NAME, 'partyTitle')
    score = driver.find_elements(By.CLASS_NAME, 'partyScore')

    values = []

    i = 0
    while (i < len(titles)):
        p = (titles[i].get_attribute('innerText')).lower()

        if p == "gpc":
            p = "grn"

        if p == "bq":
            p = "bqc"

        z = score[i].get_attribute('innerText')

        z = z.replace('\u25b2', '')
        z = z.replace('\u25bc', '')
        z = z.replace('%', '')

        z = float(z)

        z = round(z / 100, 4)
            
        values.append(p)
        values.append(z)
        i+=1
    
    return values

baseUrl = 'https://canadianpolling.ca/Canada-$$-2021'

class regions:
    name = ['BC', 'AB', 'SKMB', 'ON', 'QC', 'ATL']

data = []

for r in regions.name:
    driver.get(baseUrl.replace('$$', r))

    time.sleep(t)

    print("Running ", r)

    s = ",".join(str(x) for x in getValues())

    filename = "scrape_" + r + ".txt"

    if r == "SKMB":
        filename = "scrape_PR.txt"

    f = open(filename, "w")
    f.write(s)

x = 0



driver.quit()